const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// TEST API
app.get("/", (req, res) => {
  res.send("ALFA IT SERVICES API fonctionne 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Serveur lancé sur le port " + PORT);
});