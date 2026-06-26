const express = require("express");
const router = express.Router();

const reviewsController =
require("../controllers/reviews.controller");

const authMiddleware =
require("../middleware/auth.middleware");

const adminMiddleware =
require("../middleware/admin.middleware");

// ============================
// ⭐ ADD REVIEW (PUBLIC)
// ============================
router.post(
  "/",
  reviewsController.addReview
);

// ============================
// 📥 GET REVIEWS (PUBLIC)
// ============================
router.get(
  "/",
  reviewsController.getReviews
);

// ============================
// ❌ DELETE REVIEW (ADMIN ONLY)
// ============================
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  reviewsController.deleteReview
);

module.exports = router;