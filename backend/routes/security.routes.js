const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');
const securityController = require('../controllers/security.controller');

// Only admins and super_admin can read security
router.get('/', authenticate, authorize('admin','super_admin'), securityController.getSecurityOverview);
router.get('/errors', authenticate, authorize('admin','super_admin'), securityController.getErrors);

module.exports = router;
