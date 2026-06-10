const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ============================
// MIDDLEWARES
// ============================
app.use(cors());
app.use(express.json());

// ============================
// ROUTES
// ============================
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// ============================
// ROUTE TEST
// ============================
app.get("/", (req, res) => {
  res.send("ALFA IT SERVICES API fonctionne 🚀");
});

// ============================
// SERVER
// ============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});