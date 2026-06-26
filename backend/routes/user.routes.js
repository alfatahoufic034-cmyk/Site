const express = require("express");
const router = express.Router();

// IMPORTANT : import direct fonction
const verifyAuth = require("../intergiciels/authentification.intergiciel");

// ROUTE
router.get("/profil", verifyAuth, (req, res) => {
  res.json({
    message: "Profil utilisateur",
    user: req.user
  });
});

module.exports = router;