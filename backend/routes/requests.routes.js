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