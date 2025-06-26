export default function handler(req, res) {
  const CLIENT_ID = "1383897057814904924";
  res.status(200).json({
    message: "API is working!",
    clientId: CLIENT_ID
  });
}