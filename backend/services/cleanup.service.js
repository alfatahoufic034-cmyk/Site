const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const config = require('../config');
const supabase = require('../database/supabaseClient');
const { logger } = require('../utils/logger');

const dataDir = path.join(__dirname, '..', 'data');

const _read = (file) => {
  try { const p = path.join(dataDir, file); if (!fs.existsSync(p)) return []; return JSON.parse(fs.readFileSync(p)); } catch (e) { return []; }
};
const _write = (file, arr) => { try { const p = path.join(dataDir, file); fs.writeFileSync(p, JSON.stringify(arr, null, 2)); } catch (e) { } };

const _olderThan = (days) => {
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
  return cutoff;
};

const cleanupAudit = async () => {
  const days = config.retention.auditDays || 90;
  const cutoff = _olderThan(days);
  if (supabase) {
    try { await supabase.from('audit_logs').delete().lt('created_at', new Date(cutoff).toISOString()); logger.info('Supabase: cleaned audit older than %d days', days); } catch (e) { logger.warn('Supabase audit cleanup failed: %s', e.message); }
    return;
  }
  const items = _read('audit.json').filter(a => new Date(a.created_at).getTime() >= cutoff);
  _write('audit.json', items);
  logger.info('Local: audit cleaned, kept %d entries', items.length);
};

const cleanupAttempts = async () => {
  const days = config.retention.attemptsDays || 30;
  const cutoff = _olderThan(days);
  if (supabase) {
    try { await supabase.from('login_attempts').delete().lt('created_at', new Date(cutoff).toISOString()); logger.info('Supabase: cleaned login attempts older than %d days', days); } catch (e) { logger.warn('Supabase attempts cleanup failed: %s', e.message); }
    return;
  }
  const items = _read('login_attempts.json').filter(a => new Date(a.created_at).getTime() >= cutoff);
  _write('login_attempts.json', items);
  logger.info('Local: login_attempts cleaned, kept %d entries', items.length);
};

const cleanupBlocked = async () => {
  const days = config.retention.blockedDays || 30;
  const cutoff = _olderThan(days);
  if (supabase) {
    try { await supabase.from('blocked_ips').delete().lt('blocked_at', new Date(cutoff).toISOString()); logger.info('Supabase: cleaned blocked ips older than %d days', days); } catch (e) { logger.warn('Supabase blocked cleanup failed: %s', e.message); }
    return;
  }
  const items = _read('blocked_ips.json').filter(b => new Date(b.blocked_at).getTime() >= cutoff);
  _write('blocked_ips.json', items);
  logger.info('Local: blocked_ips cleaned, kept %d entries', items.length);
};

const cleanupSecurityAlerts = async () => {
  const days = config.retention.securityAlertsDays || 90;
  const cutoff = _olderThan(days);
  if (supabase) {
    try { await supabase.from('security_alerts').delete().lt('created_at', new Date(cutoff).toISOString()); logger.info('Supabase: cleaned security alerts older than %d days', days); } catch (e) { logger.warn('Supabase security_alerts cleanup failed: %s', e.message); }
    return;
  }
  const items = _read('security_alerts.json').filter(a => new Date(a.created_at).getTime() >= cutoff);
  _write('security_alerts.json', items);
  logger.info('Local: security_alerts cleaned, kept %d entries', items.length);
};

const runCleanup = async () => {
  try {
    await cleanupAudit();
    await cleanupAttempts();
    await cleanupBlocked();
    await cleanupSecurityAlerts();
    logger.info('Scheduled cleanup run completed');
  } catch (e) { logger.error('Scheduled cleanup failed: %s', e.message); }
};

const start = () => {
  if (config.scheduler && config.scheduler.enabled === false) return;
  // run daily at 02:00
  cron.schedule('0 2 * * *', () => {
    logger.info('Running scheduled cleanup...');
    runCleanup();
  });
  logger.info('Cleanup scheduler started');
};

module.exports = { start, runCleanup };
