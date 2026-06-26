// ============================
// 👤 PROFIL UTILISATEUR
// ============================
exports.getProfile = async (req, res) => {
  try {

    res.status(200).json({
      message: "Profil utilisateur récupéré",
      user: req.user
    });

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }
};