const { verifierToken } = require("../utils/jeton");

// ============================
// 🔒 AUTH MIDDLEWARE
// ============================
exports.verifierAuth = (req, res, next) => {

  try {

    const header =
      req.headers.authorization;

    if (!header) {
      return res.status(401).json({
        message:
          "Accès refusé (token manquant)"
      });
    }

    const parts =
      header.split(" ");

    if (
      parts.length !== 2 ||
      parts[0] !== "Bearer"
    ) {
      return res.status(401).json({
        message:
          "Format token invalide"
      });
    }

    const token =
      parts[1];

    const decoded =
      verifierToken(token);

    if (!decoded) {
      return res.status(401).json({
        message:
          "Token invalide"
      });
    }

    // 👤 inject user dans req
    req.user = decoded;

    next();

  } catch (err) {

    return res.status(500).json({
      message:
        err.message
    });

  }

};