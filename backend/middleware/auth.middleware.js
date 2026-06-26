const { verifierToken } = require("../utils/jwt");

const verifyAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization token missing"
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid authorization format"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifierToken(token);

    if (!decoded) {
      return res.status(401).json({
        message: "Invalid or expired token"
      });
    }

    req.user = decoded;

    next();

  } catch (err) {
    return res.status(500).json({
      message: "Authentication error"
    });
  }
};

// ✅ IMPORTANT FIX
module.exports = verifyAuth;