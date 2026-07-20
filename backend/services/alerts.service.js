const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const axios = require('axios');
const config = require('../config');
const supabase = require('../database/supabaseClient');
const { logger } = require('../utils/logger');
const metrics = require('./metrics.service');

const file = path.join(__dirname, '..', 'data', 'security_alerts.json');
const ensure = () => { const dir = path.dirname(file); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); if (!fs.existsSync(file)) fs.writeFileSync(file, '[]'); };

const sendEmail = async (to, subject, text) => {
  if (!config.smtp || !config.smtp.host) {
    logger.warn('SMTP not configured; skipping email to %s', to);
    return false;
  }
  const transporter = nodemailer.createTransport({ host: config.smtp.host, port: config.smtp.port, auth: { user: config.smtp.user, pass: config.smtp.pass } });
  try {
    await transporter.sendMail({ from: config.smtp.user, to, subject, text });
    return true;
  } catch (e) { logger.warn('Alert email failed: %s', e.message); return false; }
};

const sendWebhook = async (payload) => {
  const url = process.env.SECURITY_WEBHOOK_URL || '';
  if (!url) return false;
  try { await axios.post(url, payload, { timeout: 5000 }); return true; } catch (e) { logger.warn('Alert webhook failed: %s', e.message); return false; }
};

const persistAlert = async (type, payload = {}) => {
  const rec = { id: Date.now(), type, payload, created_at: new Date().toISOString() };
  if (supabase) {
    try {
      const { data, error } = await supabase.from('security_alerts').insert([{ type, payload, created_at: rec.created_at }]);
      if (!error && data && data[0]) {
        metrics.increment('security_alerts_total');
        return data[0];
      }
      if (error) throw error;
    } catch (e) {
      logger.warn('Supabase security_alert insert failed: %s', e.message);
    }
  }
  ensure();
  const items = JSON.parse(fs.readFileSync(file));
  items.push(rec);
  fs.writeFileSync(file, JSON.stringify(items, null, 2));
  metrics.increment('security_alerts_total');
  return rec;
};

const sendSecurityAlert = async (data) => {
  try {
    const admin = process.env.SECURITY_ALERT_EMAIL || '';
    if (admin) sendEmail(admin, `Security alert: ${data.type}`, JSON.stringify(data, null, 2)).catch(()=>{});
    sendWebhook({ type: 'security_alert', data }).catch(()=>{});
    const persisted = await persistAlert(data.type, data);
    logger.warn('Security alert fired: %o', data);
    return persisted;
  } catch (e) { logger.error('sendSecurityAlert failed: %s', e.message); return null; }
};

module.exports = { sendEmail, sendWebhook, sendSecurityAlert, persistAlert };
