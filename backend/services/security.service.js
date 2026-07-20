const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');
const supabase = require('../database/supabaseClient');
const metrics = require('./metrics.service');
const alerts = require('./alerts.service');

const attemptsFile = path.join(__dirname, '..', 'data', 'login_attempts.json');
const blockedFile = path.join(__dirname, '..', 'data', 'blocked_ips.json');
const ensure = (f) => { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); if (!fs.existsSync(f)) fs.writeFileSync(f, JSON.stringify([])); };

const now = () => Date.now();

const recordFailedAttempt = async (ip, identifier) => {
  try {
    const rec = { ip, identifier, success: false, created_at: new Date().toISOString() };
    if (supabase) {
      try {
        await supabase.from('login_attempts').insert([{ ip: ip, email: identifier, success: false, created_at: rec.created_at }]);
        metrics.increment('auth_failures_total');
      } catch (e) {
        logger.warn('Supabase attempt insert failed: %s', e.message);
      }
    }
    ensure(attemptsFile);
    const arr = JSON.parse(fs.readFileSync(attemptsFile));
    arr.push({ ip, identifier, ts: now(), created_at: rec.created_at });
    fs.writeFileSync(attemptsFile, JSON.stringify(arr, null, 2));
    pruneAttempts();
    // check thresholds
    const recent = arr.filter(a => a.ip === ip && a.ts > now() - 15 * 60 * 1000);
    if (recent.length >= 10) {
      await blockIp(ip, 60 * 60 * 1000, 'too many attempts');
      logger.warn('Blocked IP %s due to too many attempts', ip);
      alerts.sendSecurityAlert({ type: 'ip_block', ip, reason: 'too many attempts', count: recent.length }).catch(()=>{});
    }
  } catch (e) { logger.error('recordFailedAttempt failed: %s', e.message); }
};

const pruneAttempts = () => {
  ensure(attemptsFile);
  const arr = JSON.parse(fs.readFileSync(attemptsFile));
  const cutoff = now() - 24 * 60 * 60 * 1000;
  const filtered = arr.filter(a => a.ts >= cutoff);
  fs.writeFileSync(attemptsFile, JSON.stringify(filtered, null, 2));
};

const blockIp = async (ip, ttl = 60 * 60 * 1000, reason = '') => {
  try {
    const until = now() + ttl;
    const created_at = new Date().toISOString();
    if (supabase) {
      try {
        await supabase.from('blocked_ips').upsert([{ ip, reason, blocked_at: created_at }], { onConflict: ['ip'] });
        metrics.increment('blocked_ips_total');
      } catch (e) { logger.warn('Supabase block_ip failed: %s', e.message); }
    }
    ensure(blockedFile);
    const arr = JSON.parse(fs.readFileSync(blockedFile));
    // remove existing for same ip
    const filtered = arr.filter(b => b.ip !== ip);
    filtered.push({ ip, until, reason, blocked_at: created_at });
    fs.writeFileSync(blockedFile, JSON.stringify(filtered, null, 2));
    return true;
  } catch (e) { logger.error('blockIp failed: %s', e.message); return false; }
};

const isBlocked = (ip) => {
  ensure(blockedFile);
  const arr = JSON.parse(fs.readFileSync(blockedFile));
  const nowt = now();
  const active = arr.filter(b => b.until > nowt);
  // rewrite to remove expired
  fs.writeFileSync(blockedFile, JSON.stringify(active, null, 2));
  return active.some(b => b.ip === ip);
};

const unblockIp = async (ip) => {
  try {
    if (supabase) {
      try { await supabase.from('blocked_ips').delete().eq('ip', ip); } catch (e) { logger.warn('Supabase unblock failed: %s', e.message); }
    }
    ensure(blockedFile);
    const arr = JSON.parse(fs.readFileSync(blockedFile));
    const filtered = arr.filter(b => b.ip !== ip);
    fs.writeFileSync(blockedFile, JSON.stringify(filtered, null, 2));
    return true;
  } catch (e) { logger.error('unblockIp failed: %s', e.message); return false; }
};

module.exports = { recordFailedAttempt, isBlocked, blockIp, unblockIp };
