const fs = require('fs');
const path = require('path');
const userModel = require('../models/user.model');
const requestModel = require('../models/request.model');
const reviewModel = require('../models/review.model');
const newsModel = require('../models/news.model');
const { logger } = require('../utils/logger');
const audit = require('./audit.service');
const supabase = require('../database/supabaseClient');

const isAdmin = (actor) => actor && (actor.role === 'admin' || actor.role === 'super_admin');

const getDashboardData = async (actor) => {
  if (!isAdmin(actor)) throw { status: 403, message: 'Forbidden' };
  const dataDir = path.join(__dirname, '..', 'data');
  const read = (name) => { try { const f = path.join(dataDir, name); if (!fs.existsSync(f)) return []; return JSON.parse(fs.readFileSync(f)); } catch (e) { return []; } };
  const users = read('users.json');
  const requests = read('requests.json');
  const contacts = read('contacts.json');
  const reviews = read('reviews.json');
  const news = read('news.json');
  let securityAlertsCount = 0;
  if (supabase) {
    try {
      const { count, error } = await supabase.from('security_alerts').select('id', { count: 'exact', head: true });
      if (!error) securityAlertsCount = count || 0;
    } catch (e) { logger.warn('Failed to count security alerts for dashboard: %s', e.message); }
  } else {
    securityAlertsCount = read('security_alerts.json').length;
  }
  return { users: users.length, requests: requests.length, contacts: contacts.length, reviews: reviews.length, news: news.length, security_alerts: securityAlertsCount };
};

// record audit for admin reads
const _recordRead = (actor, action, resource) => {
  try { audit.record({ id: actor.id, email: actor.email }, action, resource, null, {}); } catch (e) {}
};

const listUsers = async (actor, q) => {
  if (!isAdmin(actor)) throw { status: 403, message: 'Forbidden' };
  const dataDir = path.join(__dirname, '..', 'data');
  const f = path.join(dataDir, 'users.json');
  if (!fs.existsSync(f)) return [];
  let users = JSON.parse(fs.readFileSync(f));
  if (q) users = users.filter(u => (u.email && u.email.includes(q)) || (u.name && u.name.includes(q)));
  return users;
};

const updateUser = async (actor, id, changes) => {
  if (!isAdmin(actor)) throw { status: 403, message: 'Forbidden' };
  const updated = await userModel.update(id, changes);
  if (!updated) throw { status: 404, message: 'Not found' };
  try { audit.record({ id: actor.id, email: actor.email }, 'update_user', 'user', id, { changes }); } catch (e) {}
  return updated;
};

const deleteUser = async (actor, id) => {
  if (!isAdmin(actor)) throw { status: 403, message: 'Forbidden' };
  // try model delete
  if (userModel.delete) {
    await userModel.delete(id);
    return true;
  }
  const dataDir = path.join(__dirname, '..', 'data');
  const f = path.join(dataDir, 'users.json');
  if (!fs.existsSync(f)) throw { status: 404, message: 'Not found' };
  let users = JSON.parse(fs.readFileSync(f));
  const origLen = users.length;
  users = users.filter(u => !((u.id && u.id == id) || u.email == id));
  if (users.length === origLen) throw { status: 404, message: 'Not found' };
  fs.writeFileSync(f, JSON.stringify(users, null, 2));
  try { audit.record({ id: actor.id, email: actor.email }, 'delete_user', 'user', id, {}); } catch (e) {}
  return true;
};

const suspendUser = async (actor, id) => {
  if (!isAdmin(actor)) throw { status: 403, message: 'Forbidden' };
  const updated = await userModel.update(id, { suspended: true });
  if (!updated) throw { status: 404, message: 'Not found' };
  try { audit.record({ id: actor.id, email: actor.email }, 'suspend_user', 'user', id, {}); } catch (e) {}
  return updated;
};

const reactivateUser = async (actor, id) => {
  if (!isAdmin(actor)) throw { status: 403, message: 'Forbidden' };
  const updated = await userModel.update(id, { suspended: false });
  if (!updated) throw { status: 404, message: 'Not found' };
  try { audit.record({ id: actor.id, email: actor.email }, 'reactivate_user', 'user', id, {}); } catch (e) {}
  return updated;
};

const listRequests = async (actor) => {
  if (!isAdmin(actor)) throw { status: 403, message: 'Forbidden' };
  const dataDir = path.join(__dirname, '..', 'data');
  const f = path.join(dataDir, 'requests.json');
  if (!fs.existsSync(f)) return [];
  return JSON.parse(fs.readFileSync(f));
};

const getRequest = async (actor, id) => {
  if (!isAdmin(actor)) throw { status: 403, message: 'Forbidden' };
  const items = await listRequests(actor);
  const rec = items.find(r => r.id == id);
  if (!rec) throw { status: 404, message: 'Not found' };
  try { audit.record({ id: actor.id, email: actor.email }, 'read_request', 'request', id, {}); } catch (e) {}
  return rec;
};

const acceptRequest = async (actor, id) => {
  if (!isAdmin(actor)) throw { status: 403, message: 'Forbidden' };
  const updated = await requestModel.update(id, { status: 'accepted', handled_by: actor.id || actor.email });
  if (!updated) throw { status: 404, message: 'Not found' };
  try { audit.record({ id: actor.id, email: actor.email }, 'accept_request', 'request', id, {}); } catch (e) {}
  return updated;
};

const refuseRequest = async (actor, id) => {
  if (!isAdmin(actor)) throw { status: 403, message: 'Forbidden' };
  const updated = await requestModel.update(id, { status: 'refused', handled_by: actor.id || actor.email });
  if (!updated) throw { status: 404, message: 'Not found' };
  try { audit.record({ id: actor.id, email: actor.email }, 'refuse_request', 'request', id, {}); } catch (e) {}
  return updated;
};

const approveReview = async (actor, id) => {
  if (!isAdmin(actor)) throw { status: 403, message: 'Forbidden' };
  const updated = await reviewModel.update(id, { status: 'approved', moderated_by: actor.id || actor.email });
  if (!updated) throw { status: 404, message: 'Not found' };
  try { audit.record({ id: actor.id, email: actor.email }, 'approve_review', 'review', id, {}); } catch (e) {}
  return updated;
};

const hideReview = async (actor, id) => {
  if (!isAdmin(actor)) throw { status: 403, message: 'Forbidden' };
  const updated = await reviewModel.update(id, { status: 'hidden', moderated_by: actor.id || actor.email });
  if (!updated) throw { status: 404, message: 'Not found' };
  try { audit.record({ id: actor.id, email: actor.email }, 'hide_review', 'review', id, {}); } catch (e) {}
  return updated;
};

const respondContact = async (actor, id, response) => {
  if (!isAdmin(actor)) throw { status: 403, message: 'Forbidden' };
  const dataDir = path.join(__dirname, '..', 'data');
  const f = path.join(dataDir, 'contacts.json');
  if (!fs.existsSync(f)) throw { status: 404, message: 'Not found' };
  const items = JSON.parse(fs.readFileSync(f));
  const idx = items.findIndex(c => c.id == id || c.email == id);
  if (idx === -1) throw { status: 404, message: 'Not found' };
  items[idx].response = response;
  items[idx].responded_by = actor.id || actor.email;
  items[idx].responded_at = new Date().toISOString();
  fs.writeFileSync(f, JSON.stringify(items, null, 2));
  try { audit.record({ id: actor.id, email: actor.email }, 'respond_contact', 'contact', id, { response }); } catch (e) {}
  return items[idx];
};

const publishNews = async (actor, id, body) => {
  if (!isAdmin(actor)) throw { status: 403, message: 'Forbidden' };
  const now = new Date().toISOString();
  const record = { id: id || `${Date.now()}`, ...body, published: true, published_by: actor.id || actor.email, published_at: now };
  return await newsModel.create(record);
};

const deleteNews = async (actor, id) => {
  if (!isAdmin(actor)) throw { status: 403, message: 'Forbidden' };
  const dataDir = path.join(__dirname, '..', 'data');
  const f = path.join(dataDir, 'news.json');
  if (!fs.existsSync(f)) throw { status: 404, message: 'Not found' };
  const items = JSON.parse(fs.readFileSync(f));
  const filtered = items.filter(n => n.id != id);
  fs.writeFileSync(f, JSON.stringify(filtered, null, 2));
  try { audit.record({ id: actor.id, email: actor.email }, 'delete_news', 'news', id, {}); } catch (e) {}
  return true;
};

const listUploads = async (actor) => {
  if (!isAdmin(actor)) throw { status: 403, message: 'Forbidden' };
  const dir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).map(f => ({ filename: f, path: `/uploads/${f}` }));
};

const deleteUpload = async (actor, filename) => {
  if (!isAdmin(actor)) throw { status: 403, message: 'Forbidden' };
  const p = path.join(__dirname, '..', 'uploads', filename);
  if (!fs.existsSync(p)) throw { status: 404, message: 'Not found' };
  fs.unlinkSync(p);
  try { audit.record({ id: actor.id, email: actor.email }, 'delete_upload', 'upload', filename, {}); } catch (e) {}
  return true;
};

const readLogs = async (actor) => {
  if (!isAdmin(actor)) throw { status: 403, message: 'Forbidden' };
  const logsDir = path.join(__dirname, '..', 'logs');
  const files = fs.existsSync(logsDir) ? fs.readdirSync(logsDir) : [];
  const data = {};
  for (const f of files) {
    const p = path.join(logsDir, f);
    data[f] = fs.readFileSync(p, 'utf8').split('\n').slice(-200).filter(Boolean);
  }
  return data;
};

module.exports = {
  getDashboardData,
  listUsers,
  updateUser,
  deleteUser,
  suspendUser,
  reactivateUser,
  listRequests,
  getRequest,
  acceptRequest,
  refuseRequest,
  approveReview,
  hideReview,
  respondContact,
  publishNews,
  deleteNews,
  listUploads,
  deleteUpload,
  readLogs
};