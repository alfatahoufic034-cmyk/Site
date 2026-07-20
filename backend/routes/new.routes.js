const express = require("express");
const router = express.Router();

const newsController =
require("../controllers/news.controller");

const verifyAuth =
require("../middleware/auth.middleware");

const adminMiddleware =
require("../middleware/admin.middleware");

// PUBLIC
router.get("/", newsController.getNews);
router.get("/:id", newsController.getOneNews);

// ADMIN
router.post("/", verifyAuth, adminMiddleware, newsController.createNews);

router.delete("/:id", verifyAuth, adminMiddleware, newsController.deleteNews);

// ⚠️ EXPORT OBLIGATOIRE
module.exports = router;