const jwt = require("jsonwebtoken");
require("dotenv").config();

// ============================
// 🔐 GÉNÉRER TOKEN
// ============================
exports.genererToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ============================
// 🔓 VÉRIFIER TOKEN
// ============================
exports.verifierToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};