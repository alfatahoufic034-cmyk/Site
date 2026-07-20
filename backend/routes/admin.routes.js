const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');
const adminController = require('../controllers/admin.controller');

router.get('/dashboard', authenticate, authorize('admin','super_admin'), (req,res,next)=>adminController.dashboard(req,res,next));
router.get('/users', authenticate, authorize('admin','super_admin'), (req,res,next)=>adminController.listUsers(req,res,next));
router.put('/users/:id', authenticate, authorize('admin','super_admin'), (req,res,next)=>adminController.updateUser(req,res,next));
router.delete('/users/:id', authenticate, authorize('admin','super_admin'), (req,res,next)=>adminController.deleteUser(req,res,next));
router.put('/users/:id/suspend', authenticate, authorize('admin','super_admin'), (req,res,next)=>adminController.suspendUser(req,res,next));
router.put('/users/:id/reactivate', authenticate, authorize('admin','super_admin'), (req,res,next)=>adminController.reactivateUser(req,res,next));

router.post('/requests/:id/accept', authenticate, authorize('admin','super_admin'), (req,res,next)=>adminController.acceptRequest(req,res,next));
router.post('/requests/:id/refuse', authenticate, authorize('admin','super_admin'), (req,res,next)=>adminController.refuseRequest(req,res,next));
router.get('/requests', authenticate, authorize('admin','super_admin'), (req,res,next)=>adminController.listRequests(req,res,next));
router.get('/requests/:id', authenticate, authorize('admin','super_admin'), (req,res,next)=>adminController.getRequest(req,res,next));
router.post('/reviews/:id/approve', authenticate, authorize('admin','super_admin'), (req,res,next)=>adminController.approveReview(req,res,next));
router.post('/reviews/:id/hide', authenticate, authorize('admin','super_admin'), (req,res,next)=>adminController.hideReview(req,res,next));
router.post('/contacts/:id/respond', authenticate, authorize('admin','super_admin'), (req,res,next)=>adminController.respondContact(req,res,next));
router.post('/news/:id/publish', authenticate, authorize('admin','super_admin'), (req,res,next)=>adminController.publishNews(req,res,next));
router.delete('/news/:id', authenticate, authorize('admin','super_admin'), (req,res,next)=>adminController.deleteNews(req,res,next));
router.delete('/uploads/:filename', authenticate, authorize('admin','super_admin'), (req,res,next)=>adminController.deleteUpload(req,res,next));

router.get('/uploads', authenticate, authorize('admin','super_admin'), (req,res,next)=>adminController.listUploads(req,res,next));
router.get('/logs', authenticate, authorize('admin','super_admin'), (req,res,next)=>adminController.readLogs(req,res,next));
// Monitoring / security endpoints
router.get('/security', authenticate, authorize('super_admin'), (req,res,next)=>adminController.securitySummary(req,res,next));
router.get('/analytics', authenticate, authorize('admin','super_admin'), (req,res,next)=>adminController.analytics(req,res,next));
router.get('/errors', authenticate, authorize('admin','super_admin'), (req,res,next)=>adminController.errors(req,res,next));
router.get('/login-attempts', authenticate, authorize('admin','super_admin'), (req,res,next)=>adminController.loginAttempts(req,res,next));
router.get('/blocked-ips', authenticate, authorize('admin','super_admin'), (req,res,next)=>adminController.blockedIps(req,res,next));
router.get('/security-alerts', authenticate, authorize('admin','super_admin'), (req,res,next)=>adminController.securityAlerts(req,res,next));
router.get('/audit-logs', authenticate, authorize('super_admin'), (req,res,next)=>adminController.auditLogs(req,res,next));

module.exports = router;