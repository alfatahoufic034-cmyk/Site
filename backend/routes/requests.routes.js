const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const requestsController = require('../controllers/requests.controller');

router.post('/', authenticate, requestsController.createRequest);
router.get('/', authenticate, requestsController.getMyRequests);
router.put('/:id', authenticate, requestsController.updateRequest);
router.delete('/:id', authenticate, requestsController.deleteRequest);

module.exports = router;
const express = require("express");

const router = express.Router();

// ============================
// IMPORTS
// ============================
const requestsController =
require("../controllers/requests.controller");

const {
  verifyAuth
} = require(
  "../middleware/auth.middleware"
);

const adminMiddleware =
require(
  "../middleware/admin.middleware"
);

// ============================
// 📩 CREATE REQUEST (PUBLIC)
// ============================
router.post(
  "/",
  requestsController.createRequest
);

// ============================
// 📥 GET REQUESTS (ADMIN)
// ============================
router.get(
  "/",
  verifyAuth,
  adminMiddleware,
  requestsController.getRequests
);

// ============================
// ❌ DELETE REQUEST (ADMIN)
// ============================
router.delete(
  "/:id",
  verifyAuth,
  adminMiddleware,
  requestsController.deleteRequest
);

// ============================
// EXPORT
// ============================
module.exports = router;