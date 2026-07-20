const security = require('../services/security.service');

const checkIpBlock = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
  if (security.isBlocked(ip)) return res.status(429).json({ error: 'Too many requests from your IP' });
  next();
};

module.exports = { checkIpBlock };
