const reviewModel = require('../models/review.model');

const createReview = async (req, res, next) => {
  try {
    const payload = { ...req.body, user_id: req.user.id || req.user.email, created_at: new Date().toISOString(), status: 'pending' };
    const created = await reviewModel.create(payload);
    res.status(201).json({ review: created });
  } catch (err) { next(err); }
};

const updateReview = async (req, res, next) => {
  try { const updated = await reviewModel.update(req.params.id, req.body); if(!updated) return res.status(404).json({error:'Not found'}); res.json({ review: updated }); } catch (err) { next(err); }
};

module.exports = { createReview, updateReview };
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