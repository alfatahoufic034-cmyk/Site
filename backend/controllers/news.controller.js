const newsModel = require('../models/news.model');

const listNews = async (req, res, next) => {
  try { const data = await newsModel.all(); res.json({ news: data }); } catch (err) { next(err); }
};

const createNews = async (req, res, next) => {
  try { const created = await newsModel.create({ ...req.body, created_at: new Date().toISOString(), author: req.user && req.user.id }); res.status(201).json({ news: created }); } catch (err) { next(err); }
};

module.exports = { listNews, createNews };
const newsService = require("../services/news.service");

// ============================
// 📰 CREATE NEWS
// ============================
exports.createNews = async (req, res) => {
  try {
    const data = await newsService.createNews(req.body);

    return res.status(201).json({
      message: "News créée avec succès",
      data
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};

// ============================
// 📥 GET ALL NEWS
// ============================
exports.getNews = async (req, res) => {
  try {
    const data = await newsService.getAllNews();

    return res.status(200).json({
      message: "Liste des news",
      data
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};

// ============================
// 📄 GET ONE NEWS
// ============================
exports.getOneNews = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await newsService.getNewsById(id);

    return res.status(200).json({
      message: "News trouvée",
      data
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};

// ============================
// ❌ DELETE NEWS
// ============================
exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    await newsService.deleteNews(id);

    return res.status(200).json({
      message: "News supprimée"
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};