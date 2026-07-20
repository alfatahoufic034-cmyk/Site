const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

const { logger, requestLogger } = require("./utils/logger");
const errorHandler = require("./middleware/error.middleware");
const config = require('./config');
const cleanup = require('./services/cleanup.service');
const metrics = require('./services/metrics.service');
const supabase = require('./database/supabaseClient');

const app = express();

// Basic hardening
app.disable("x-powered-by");
app.use(helmet());

// CORS: restrict in production via env
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsers
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Request logging
app.use(requestLogger);
// metrics middleware
app.use(metrics.metricsMiddleware);

// Rate limiter (global)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." }
});
app.use(apiLimiter);

// Serve uploads (read-only)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Safe require helper
const safeRequire = (p) => {
  try {
    return require(p);
  } catch (err) {
    logger.warn(`Failed to load ${p}: ${err.message}`);
    return null;
  }
};

// Load routes
const authRoutes = safeRequire("./routes/auth.routes");
const adminRoutes = safeRequire("./routes/admin.routes");
const uploadsRoutes = safeRequire("./routes/uploads.routes");
const securityRoutes = safeRequire("./routes/security.routes");

if (authRoutes) app.use("/api/auth", authRoutes);
if (adminRoutes) app.use("/api/admin", adminRoutes);
if (uploadsRoutes) app.use("/api/uploads", uploadsRoutes);
if (securityRoutes) app.use("/api/admin/security", securityRoutes);

// Basic health
app.get("/", (req, res) => res.status(200).json({ app: "ALFA IT SERVICES API", status: "running" }));

// Liveness
app.get('/live', (req, res) => res.status(200).json({ status: 'alive' }));
// Readiness
app.get('/ready', async (req, res) => {
  try {
    if (supabase) {
      // try a light query
      const { error } = await supabase.from('audit_logs').select('id').limit(1);
      if (error) return res.status(503).json({ ready: false, reason: 'supabase error' });
    }
    return res.status(200).json({ ready: true });
  } catch (e) { return res.status(503).json({ ready: false, reason: e.message }); }
});

// Prometheus metrics
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', metrics.register.contentType);
    res.send(await metrics.register.metrics());
  } catch (e) { res.status(500).send('metrics error'); }
});

// 404
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
    if (config.scheduler && config.scheduler.enabled) {
      try { cleanup.start(); } catch (e) { logger.warn('Failed to start cleanup scheduler: %s', e.message); }
    }
  });
}

module.exports = app;