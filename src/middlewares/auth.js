const jwt = require("jsonwebtoken");
require("dotenv").config();

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader)
    return res.status(401).json({ message: "Missing Authorization header" });

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;
  if (!token) return res.status(401).json({ message: "Invalid token format" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = authenticateJWT;
