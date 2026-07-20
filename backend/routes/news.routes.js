const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');
const newsController = require('../controllers/news.controller');

router.get('/', newsController.listNews);
router.post('/', authenticate, authorize('admin','super_admin'), newsController.createNews);

module.exports = router;
