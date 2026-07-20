const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');

const dailyRotateTransport = new transports.DailyRotateFile({
  filename: `${logDir}/%DATE%-application.log`,
  datePattern: 'YYYY-MM-DD',
  maxFiles: '30d',
  level: 'info'
});

const errorTransport = new transports.DailyRotateFile({
  filename: `${logDir}/%DATE%-error.log`,
  datePattern: 'YYYY-MM-DD',
  maxFiles: '30d',
  level: 'error'
});

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: false }),
    format.splat(),
    format.json()
  ),
  transports: [dailyRotateTransport, errorTransport, new transports.Console({ level: 'debug', format: format.simple() })]
});

const requestLogger = (req, res, next) => {
  logger.info('%s %s %s', req.method, req.originalUrl, req.ip);
  next();
};

module.exports = { logger, requestLogger };
