const express = require("express");
const router = express.Router();

const { verifierAuth } = require("../intergiciels/authentification.intergiciel");

router.get("/profil", verifierAuth, (req, res) => {
  res.json({
    message: "Profil utilisateur",
    user: req.user
  });
});

module.exports = router;