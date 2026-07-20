const nodemailer = require('nodemailer');
const config = require('../config');
const { logger } = require('../utils/logger');

let transporter = null;
if (config.smtp && config.smtp.host && config.smtp.user) {
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: { user: config.smtp.user, pass: config.smtp.pass }
  });
}

const send = async ({ to, subject, text, html }) => {
  if (!transporter) {
    logger.warn('SMTP not configured; skipping email to %s', to);
    return false;
  }
  const info = await transporter.sendMail({ from: config.smtp.user, to, subject, text, html });
  logger.info('Email sent: %s', info.messageId);
  return info;
};

module.exports = { send, sendMail: send };
