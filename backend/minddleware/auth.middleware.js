const { verifierToken } = require("../utils/jwt");

// ============================
// PROTECTION JWT
// ============================
exports.verifyAuth = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Token manquant"
    });
  }

  const token = authHeader.split(" ")[1];

  const decoded = verifierToken(token);

  if (!decoded) {
    return res.status(401).json({
      message: "Token invalide"
    });
  }

  req.user = decoded;

  next();
};