const { logger } = require('../utils/logger');

module.exports = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err && err.status ? err.status : 500;
  const safeMessage = status >= 500 ? 'Internal server error' : (err && err.message ? err.message : 'Error');
  logger.error('%s %s %s %o', req.method, req.originalUrl, status, { message: err && err.message ? err.message : err });
  return res.status(status).json({ error: safeMessage });
};
