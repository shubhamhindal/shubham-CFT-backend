const jwt = require("jsonwebtoken");
require("dotenv").config();

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (email !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const payload = { email, role: "admin" };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "8h" });

  return res.json({ token });
}

module.exports = { login };
