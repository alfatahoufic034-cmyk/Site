const express = require("express");

const router = express.Router();

// ============================
// IMPORTS
// ============================
const uploadsController =
require("../controllers/uploads.controller");

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
// 📤 UPLOAD FILE
// ============================
router.post(
  "/",
  verifyAuth,
  uploadsController.uploadFile
);

// ============================
// 📥 GET UPLOADS
// ============================
router.get(
  "/",
  verifyAuth,
  adminMiddleware,
  uploadsController.getUploads
);

// ============================
// ❌ DELETE UPLOAD
// ============================
router.delete(
  "/:id",
  verifyAuth,
  adminMiddleware,
  uploadsController.deleteUpload
);

// ============================
module.exports = router;