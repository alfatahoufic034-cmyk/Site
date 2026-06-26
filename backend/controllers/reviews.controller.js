const reviewsService = require("../services/reviews.service");

// ============================
// ⭐ AJOUTER AVIS
// ============================
exports.addReview = async (req, res) => {
  try {
    const data = await reviewsService.addReview(req.body);

    return res.status(201).json({
      message: "Avis ajouté avec succès",
      data
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};

// ============================
// 📥 GET AVIS
// ============================
exports.getReviews = async (req, res) => {
  try {
    const data = await reviewsService.getAllReviews();

    return res.status(200).json({
      message: "Liste des avis",
      data
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};

// ============================
// ❌ DELETE AVIS (ADMIN)
// ============================
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    await reviewsService.deleteReview(id);

    return res.status(200).json({
      message: "Avis supprimé"
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};