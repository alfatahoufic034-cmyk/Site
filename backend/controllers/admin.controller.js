const adminService = require('../services/admin.service');
const fs = require('fs');
const path = require('path');
const audit = require('../services/audit.service');

const dashboard = async (req, res, next) => {
  try {
    const data = await adminService.getDashboardData(req.user);
    res.json({ counts: data });
  } catch (err) { next(err); }
};

const listUsers = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    const users = await adminService.listUsers(req.user, q);
    res.json({ users });
  } catch (err) { next(err); }
};

const updateUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    const changes = req.body;
    const updated = await adminService.updateUser(req.user, id, changes);
    res.json({ user: updated });
  } catch (err) { next(err); }
};

const suspendUser = async (req, res, next) => {
  try { const id = req.params.id; const updated = await adminService.suspendUser(req.user, id); res.json({ user: updated }); } catch (err) { next(err); }
};

const reactivateUser = async (req, res, next) => {
  try { const id = req.params.id; const updated = await adminService.reactivateUser(req.user, id); res.json({ user: updated }); } catch (err) { next(err); }
};

const acceptRequest = async (req, res, next) => {
  try { const id = req.params.id; const updated = await adminService.acceptRequest(req.user, id); res.json({ request: updated }); } catch (err) { next(err); }
};

const refuseRequest = async (req, res, next) => {
  try { const id = req.params.id; const updated = await adminService.refuseRequest(req.user, id); res.json({ request: updated }); } catch (err) { next(err); }
};

const listRequests = async (req, res, next) => {
  try { const items = await adminService.listRequests(req.user); res.json({ requests: items }); } catch (err) { next(err); }
};

const getRequest = async (req, res, next) => {
  try { const rec = await adminService.getRequest(req.user, req.params.id); res.json({ request: rec }); } catch (err) { next(err); }
};

const deleteUser = async (req, res, next) => {
  try { const id = req.params.id; await adminService.deleteUser(req.user, id); res.json({ deleted: true }); } catch (err) { next(err); }
};

// listRequests and getRequest delegated to adminService above

const approveReview = async (req, res, next) => {
  try { const id = req.params.id; const updated = await adminService.approveReview(req.user, id); res.json({ review: updated }); } catch (err) { next(err); }
};

const hideReview = async (req, res, next) => {
  try { const id = req.params.id; const updated = await adminService.hideReview(req.user, id); res.json({ review: updated }); } catch (err) { next(err); }
};

const respondContact = async (req, res, next) => {
  try { const id = req.params.id; const { response } = req.body; const updated = await adminService.respondContact(req.user, id, response); res.json({ contact: updated }); } catch (err) { next(err); }
};

const publishNews = async (req, res, next) => {
  try { const id = req.params.id; const created = await adminService.publishNews(req.user, id, req.body); res.json({ news: created }); } catch (err) { next(err); }
};

const deleteNews = async (req, res, next) => {
  try { const id = req.params.id; await adminService.deleteNews(req.user, id); res.json({ deleted: true }); } catch (err) { next(err); }
};

const deleteUpload = async (req, res, next) => {
  try { const filename = req.params.filename; await adminService.deleteUpload(req.user, filename); res.json({ deleted: true }); } catch (err) { next(err); }
};

const listUploads = async (req, res, next) => { try { const files = await adminService.listUploads(req.user); res.json({ uploads: files }); } catch (err) { next(err); } };

const readLogs = async (req, res, next) => { try { const data = await adminService.readLogs(req.user); res.json({ logs: data }); } catch (err) { next(err); } };

// Monitoring endpoints
const monitoringService = require('../services/monitoring.service');

const securitySummary = async (req, res, next) => {
  try {
    const overview = await monitoringService.getSecuritySummary();
    const alerts = await monitoringService.getSecurityAlerts({ limit: 20, sort: 'created_at', order: 'desc' });
    await audit.record({ id: req.user.id, email: req.user.email }, 'read_security_summary', 'security', null, { count: alerts.length });
    res.json({ overview, recent_alerts: alerts });
  } catch (err) { next(err); }
};

const analytics = async (req, res, next) => { try { const data = await monitoringService.getAnalytics(); res.json({ analytics: data }); } catch (err) { next(err); } };

const errors = async (req, res, next) => {
  try {
    const { limit = 500, q, startDate, endDate } = req.query;
    const data = await monitoringService.getErrors({ limit: parseInt(limit,10), q, startDate, endDate });
    res.json({ errors: data });
  } catch (err) { next(err); }
};

const loginAttempts = async (req, res, next) => {
  try {
    const { page = 0, limit = 100, q, startDate, endDate, sort = 'created_at', order = 'desc', export: _export } = req.query;
    const offset = page * limit;
    const data = await monitoringService.getLoginAttempts({ limit: parseInt(limit,10), offset: parseInt(offset,10), q, startDate, endDate, sort, order });
    if (_export === 'csv') {
      const csv = data.map(r => `${r.ip},${r.email},${r.created_at}`).join('\n');
      res.set('Content-Type', 'text/csv');
      return res.send(`ip,email,created_at\n${csv}`);
    }
    res.json({ attempts: data });
  } catch (err) { next(err); }
};

const blockedIps = async (req, res, next) => {
  try {
    const { page = 0, limit = 100, q, startDate, endDate, sort = 'blocked_at', order = 'desc', export: _export } = req.query;
    const offset = page * limit;
    const data = await monitoringService.getBlockedIps({ limit: parseInt(limit,10), offset: parseInt(offset,10), q, startDate, endDate, sort, order });
    if (_export === 'csv') {
      const csv = data.map(r => `${r.ip},${r.reason || ''},${r.blocked_at || r.created_at || ''}`).join('\n');
      res.set('Content-Type', 'text/csv');
      return res.send(`ip,reason,blocked_at\n${csv}`);
    }
    res.json({ blocked: data });
  } catch (err) { next(err); }
};

const securityAlerts = async (req, res, next) => {
  try {
    const { page = 0, limit = 100, q, startDate, endDate, sort = 'created_at', order = 'desc', export: _export } = req.query;
    const offset = page * limit;
    const data = await monitoringService.getSecurityAlerts({ limit: parseInt(limit,10), offset: parseInt(offset,10), q, startDate, endDate, sort, order });
    await audit.record({ id: req.user.id, email: req.user.email }, 'read_security_alerts', 'security_alerts', null, { q, page, limit: data.length });
    if (_export === 'csv') {
      const csv = data.map(r => `${r.type},"${JSON.stringify(r.payload || {})}",${r.created_at}`).join('\n');
      res.set('Content-Type', 'text/csv');
      return res.send(`type,payload,created_at\n${csv}`);
    }
    res.json({ alerts: data });
  } catch (err) { next(err); }
};

const auditLogs = async (req, res, next) => {
  try {
    const { page = 0, limit = 100, q, startDate, endDate, sort = 'created_at', order = 'desc', export: _export } = req.query;
    const offset = page * limit;
    const data = await monitoringService.getAuditLogs({ limit: parseInt(limit,10), offset: parseInt(offset,10), q, startDate, endDate, sort, order });
    if (_export === 'csv') {
      const csv = data.map(r => `${(r.actor && r.actor.email) || r.actor_email || ''},${r.action},${r.resource},${r.resource_id || ''},"${JSON.stringify(r.meta || r.details || {})}",${r.created_at}`).join('\n');
      res.set('Content-Type', 'text/csv');
      return res.send(`actor,action,resource,resource_id,meta,created_at\n${csv}`);
    }
    res.json({ audits: data });
  } catch (err) { next(err); }
};

module.exports = {
  dashboard,
  listUsers,
  deleteUser,
  updateUser,
  suspendUser,
  reactivateUser,
  acceptRequest,
  refuseRequest,
  approveReview,
  hideReview,
  respondContact,
  publishNews,
  deleteNews,
  deleteUpload,
  listUploads,
  readLogs,
  securitySummary,
  analytics,
  errors,
  loginAttempts,
  blockedIps,
  securityAlerts,
  auditLogs
};