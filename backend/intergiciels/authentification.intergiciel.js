const { verifierToken } = require("../utilitaires/jeton");

// ============================
// 🔒 PROTECTION ROUTE
// ============================
exports.verifierAuth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "Accès refusé (token manquant)" });
  }

  const token = header.split(" ")[1];

  const decoded = verifierToken(token);

  if (!decoded) {
    return res.status(401).json({ message: "Token invalide" });
  }

  req.user = decoded;
  next();
};