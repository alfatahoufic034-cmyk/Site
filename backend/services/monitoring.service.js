const fs = require('fs');
const path = require('path');
const supabase = require('../database/supabaseClient');
const config = require('../config');
const userModel = require('../models/user.model');
const requestModel = require('../models/request.model');
const reviewModel = require('../models/review.model');
const newsModel = require('../models/news.model');

const dataDir = path.join(__dirname, '..', 'data');
const logsDir = path.join(__dirname, '..', 'logs');

const readJson = (file) => {
  try {
    const p = path.join(dataDir, file);
    if (!fs.existsSync(p)) return [];
    return JSON.parse(fs.readFileSync(p));
  } catch (e) { return []; }
};

const getAuditLogs = async ({ limit = 100, offset = 0, q, startDate, endDate, sort = 'created_at', order = 'desc' } = {}) => {
  if (supabase) {
    let query = supabase.from('audit_logs').select('*');
    if (q) {
      // simple search on action or resource
      query = query.or(`action.ilike.%${q}%,resource.ilike.%${q}%`);
    }
    if (startDate) query = query.gte('created_at', new Date(startDate).toISOString());
    if (endDate) query = query.lte('created_at', new Date(endDate).toISOString());
    const ascending = order === 'asc';
    const { data, error } = await query.order(sort, { ascending }).range(offset, offset + limit - 1);
    if (error) throw error;
    return data;
  }
  let items = readJson('audit.json');
  if (q) items = items.filter(i => (i.actor_email && i.actor_email.includes(q)) || (i.action && i.action.includes(q)) || (i.resource && i.resource.includes(q)) || JSON.stringify(i.details || {}).includes(q));
  if (startDate) items = items.filter(i => new Date(i.created_at) >= new Date(startDate));
  if (endDate) items = items.filter(i => new Date(i.created_at) <= new Date(endDate));
  items = items.sort((a,b)=> new Date(b[sort]) - new Date(a[sort]));
  if (order === 'asc') items = items.reverse();
  return items.slice(offset, offset+limit);
};

const getLoginAttempts = async ({ limit = 100, offset = 0, q, startDate, endDate, sort = 'created_at', order = 'desc' } = {}) => {
  if (supabase) {
    let query = supabase.from('login_attempts').select('*');
    if (q) query = query.or(`ip.ilike.%${q}%,email.ilike.%${q}%`);
    if (startDate) query = query.gte('created_at', new Date(startDate).toISOString());
    if (endDate) query = query.lte('created_at', new Date(endDate).toISOString());
    const ascending = order === 'asc';
    const { data, error } = await query.order(sort, { ascending }).range(offset, offset + limit - 1);
    if (error) throw error;
    return data;
  }
  let items = readJson('login_attempts.json').map(i=> ({ ip: i.ip, email: i.identifier, created_at: i.created_at || new Date(i.ts).toISOString() }));
  if (q) items = items.filter(i => (i.ip && i.ip.includes(q)) || (i.email && i.email.includes(q)));
  if (startDate) items = items.filter(i => new Date(i.created_at) >= new Date(startDate));
  if (endDate) items = items.filter(i => new Date(i.created_at) <= new Date(endDate));
  items = items.sort((a,b)=> new Date(b[sort]) - new Date(a[sort]));
  if (order === 'asc') items = items.reverse();
  return items.slice(offset, offset+limit);
};

const getBlockedIps = async ({ limit = 100, offset = 0, q, startDate, endDate, sort = 'blocked_at', order = 'desc' } = {}) => {
  if (supabase) {
    let query = supabase.from('blocked_ips').select('*');
    if (q) query = query.ilike('ip', `%${q}%`);
    if (startDate) query = query.gte('blocked_at', new Date(startDate).toISOString());
    if (endDate) query = query.lte('blocked_at', new Date(endDate).toISOString());
    const ascending = order === 'asc';
    const { data, error } = await query.order(sort, { ascending }).range(offset, offset + limit - 1);
    if (error) throw error;
    return data;
  }
  let items = readJson('blocked_ips.json');
  if (q) items = items.filter(i => i.ip && i.ip.includes(q));
  if (startDate) items = items.filter(i => new Date(i.blocked_at) >= new Date(startDate));
  if (endDate) items = items.filter(i => new Date(i.blocked_at) <= new Date(endDate));
  items = items.sort((a,b)=> new Date(b[sort]) - new Date(a[sort]));
  if (order === 'asc') items = items.reverse();
  return items.slice(offset, offset+limit);
};

const getSecurityAlerts = async ({ limit = 100, offset = 0, q, startDate, endDate, sort = 'created_at', order = 'desc' } = {}) => {
  if (supabase) {
    let query = supabase.from('security_alerts').select('*');
    if (q) query = query.or(`type.ilike.%${q}%,payload::text.ilike.%${q}%`);
    if (startDate) query = query.gte('created_at', new Date(startDate).toISOString());
    if (endDate) query = query.lte('created_at', new Date(endDate).toISOString());
    const ascending = order === 'asc';
    const { data, error } = await query.order(sort, { ascending }).range(offset, offset + limit - 1);
    if (error) throw error;
    return data;
  }
  let items = readJson('security_alerts.json');
  if (q) items = items.filter(i => (i.type && i.type.includes(q)) || JSON.stringify(i.payload || {}).includes(q));
  if (startDate) items = items.filter(i => new Date(i.created_at) >= new Date(startDate));
  if (endDate) items = items.filter(i => new Date(i.created_at) <= new Date(endDate));
  items = items.sort((a,b)=> new Date(b[sort]) - new Date(a[sort]));
  if (order === 'asc') items = items.reverse();
  return items.slice(offset, offset+limit);
};

const getSecuritySummary = async () => {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  if (supabase) {
    const totalRes = await supabase.from('security_alerts').select('*', { count: 'exact', head: true });
    if (totalRes.error) throw totalRes.error;
    const last24hRes = await supabase.from('security_alerts').select('*', { count: 'exact', head: true }).gte('created_at', last24h);
    if (last24hRes.error) throw last24hRes.error;
    const last7dRes = await supabase.from('security_alerts').select('*', { count: 'exact', head: true }).gte('created_at', last7d);
    if (last7dRes.error) throw last7dRes.error;
    const latestRes = await supabase.from('security_alerts').select('*').order('created_at', { ascending: false }).limit(1);
    if (latestRes.error) throw latestRes.error;
    return {
      total: totalRes.count || 0,
      last_24h: last24hRes.count || 0,
      last_7d: last7dRes.count || 0,
      latest: latestRes.data && latestRes.data[0] ? latestRes.data[0] : null
    };
  }

  const items = readJson('security_alerts.json');
  const latest = items.slice().sort((a,b) => new Date(b.created_at) - new Date(a.created_at))[0] || null;
  return {
    total: items.length,
    last_24h: items.filter(i => new Date(i.created_at) >= new Date(last24h)).length,
    last_7d: items.filter(i => new Date(i.created_at) >= new Date(last7d)).length,
    latest
  };
};

const getLogs = async ({ lines = 500 } = {}) => {
  try {
    if (!fs.existsSync(logsDir)) return [];
    const files = fs.readdirSync(logsDir).filter(f=>f.endsWith('.log')).sort().reverse();
    const out = [];
    for (const f of files) {
      const p = path.join(logsDir, f);
      const content = fs.readFileSync(p, 'utf8').trim().split(/\r?\n/).reverse();
      for (const line of content) {
        out.push(line);
        if (out.length >= lines) return out;
      }
    }
    return out;
  } catch (e) { return []; }
};

const getErrors = async ({ limit = 200, q, startDate, endDate } = {}) => {
  const logs = await getLogs({ lines: 2000 });
  let errors = logs.filter(l => /error/i.test(l));
  if (q) errors = errors.filter(l => l.toLowerCase().includes(q.toLowerCase()));
  // basic date filtering if lines include ISO timestamp at start
  if (startDate) errors = errors.filter(l => { const d = new Date(l.slice(0,30)); return !isNaN(d) && d >= new Date(startDate); });
  if (endDate) errors = errors.filter(l => { const d = new Date(l.slice(0,30)); return !isNaN(d) && d <= new Date(endDate); });
  return errors.slice(0, limit);
};

const getAnalytics = async () => {
  const users = await (userModel.list ? userModel.list() : []);
  const requests = await (requestModel.list ? requestModel.list() : []);
  const reviews = await (reviewModel.list ? reviewModel.list() : []);
  const news = await (newsModel.list ? newsModel.list() : []);
  return {
    users: users.length,
    requests: requests.length,
    reviews: reviews.length,
    news: news.length
  };
};

module.exports = {
  getAuditLogs,
  getLoginAttempts,
  getBlockedIps,
  getSecurityAlerts,
  getSecuritySummary,
  getLogs,
  getErrors,
  getAnalytics
};
