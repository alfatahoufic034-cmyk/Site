const authorize = (...allowedRoles) => (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (!allowedRoles.length) return next();
    if (allowedRoles.includes(user.role)) return next();
    return res.status(403).json({ error: 'Forbidden' });
  } catch (err) {
    return res.status(403).json({ error: 'Forbidden' });
  }
};

module.exports = { authorize };
