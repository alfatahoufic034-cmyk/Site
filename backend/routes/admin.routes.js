const express = require("express");
const router = express.Router();

const adminController =
require("../controllers/admin.controller");

const {
  verifierAuth
} = require("../intergiciels/authentification.intergiciel");

const adminMiddleware =
require("../middleware/admin.middleware");

// ============================
// 📊 DASHBOARD ADMIN
// ============================
router.get(
  "/dashboard",
  verifierAuth,
  adminMiddleware,
  adminController.getDashboard
);

// ============================
// 👥 LISTE USERS
// ============================
router.get(
  "/users",
  verifierAuth,
  adminMiddleware,
  adminController.getAllUsers
);

// ============================
// ❌ DELETE USER
// ============================
router.delete(
  "/users/:id",
  verifierAuth,
  adminMiddleware,
  adminController.deleteUser
);

module.exports = router;