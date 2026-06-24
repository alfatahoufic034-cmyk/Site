const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ============================
// MIDDLEWARES
// ============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================
// SAFE IMPORT FUNCTION (ANTI CRASH)
// ============================
const safeRequire = (path) => {
  try {
    return require(path);
  } catch (err) {
    console.error(`❌ Error loading ${path}:`, err.message);
    return null;
  }
};

// ============================
// ROUTES IMPORT
// ============================
const authRoutes = safeRequire("./routes/auth.routes");
const usersRoutes = safeRequire("./routes/user.routes");
const adminRoutes = safeRequire("./routes/admin.routes");
const contactRoutes = safeRequire("./routes/contact.routes");
const reviewsRoutes = safeRequire("./routes/reviews.routes");
const requestsRoutes = safeRequire("./routes/requests.routes");

// ⚠️ attention ici (tu avais "new.routes.js")
const newsRoutes = safeRequire("./routes/new.routes");

const uploadsRoutes = safeRequire("./routes/uploads.routes");

// ============================
// ROUTES REGISTER (SAFE)
// ============================
if (authRoutes) app.use("/api/auth", authRoutes);
if (usersRoutes) app.use("/api/users", usersRoutes);
if (adminRoutes) app.use("/api/admin", adminRoutes);
if (contactRoutes) app.use("/api/contact", contactRoutes);
if (reviewsRoutes) app.use("/api/reviews", reviewsRoutes);
if (requestsRoutes) app.use("/api/requests", requestsRoutes);
if (newsRoutes) app.use("/api/news", newsRoutes);
if (uploadsRoutes) app.use("/api/uploads", uploadsRoutes);

// ============================
// TEST ROUTE
// ============================
app.get("/", (req, res) => {
  res.status(200).json({
    app: "ALFA IT SERVICES API",
    status: "running"
  });
});

// ============================
// 404 HANDLER
// ============================
app.use((req, res) => {
  return res.status(404).json({
    message: "Route not found"
  });
});

// ============================
// SERVER
// ============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});