const express = require("express");
const fetch = require("node-fetch");

const app = express();

const CLIENT_ID = process.env.1383897057814904924;
const CLIENT_SECRET = process.env.4chN9rsirXU2gppE0EeGNQ6gOmisYKiz;
const BOT_TOKEN = process.env.MTM4Mzg5NzA1NzgxNDkwNDkyNA.G_dRYk.Uns1RJnct8rHY4biRebr63WXf6F8xfExsMqSAE;
const GUILD_ID = process.env.955874986210521198;
const REDIRECT_URI = process.env.https://treflebackup.vercel.app/api/callback; // e.g. https://treflebackup.vercel.app/api/callback

app.get("/", (req, res) => {
  res.send(`<a href="/api/login">Login with Discord</a>`);
});

app.get("/api/login", (req, res) => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "identify guilds.join",
    prompt: "consent"
  });
  res.redirect(`https://discord.com/oauth2/authorize?${params.toString()}`);
});

app.get("/api/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("No code provided");

  // 1. Exchange code for access token
  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      scope: "identify guilds.join"
    })
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) return res.status(400).send(`Token error: ${JSON.stringify(tokenData)}`);

  // 2. Get user info
  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  const userData = await userRes.json();
  if (!userData.id) return res.status(400).send("Failed to fetch user data");

  // 3. Add user to the guild
  const guildRes = await fetch(`https://discord.com/api/guilds/${GUILD_ID}/members/${userData.id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ access_token: tokenData.access_token })
  });

  if (guildRes.status === 201 || guildRes.status === 204) {
    res.send(`<h2>Success! You have been added to the backup server.</h2>`);
  } else {
    const errorText = await guildRes.text();
    res.status(400).send(`Failed to add to server: ${errorText}`);
  }
});

module.exports = app;