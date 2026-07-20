const requestModel = require('../models/request.model');

const createRequest = async (req, res, next) => {
  try {
    const payload = { ...req.body, user_id: req.user.id || req.user.email, created_at: new Date().toISOString() };
    const created = await requestModel.create(payload);
    res.status(201).json({ request: created });
  } catch (err) { next(err); }
};

const getMyRequests = async (req, res, next) => {
  try { const data = await requestModel.findByUser(req.user.id || req.user.email); res.json({ requests: data }); } catch (err) { next(err); }
};

const updateRequest = async (req, res, next) => {
  try { const updated = await requestModel.update(req.params.id, req.body); if(!updated) return res.status(404).json({error:'Not found'}); res.json({ request: updated }); } catch (err) { next(err); }
};

const deleteRequest = async (req, res, next) => {
  try { await requestModel.remove(req.params.id); res.json({ deleted: true }); } catch (err) { next(err); }
};

module.exports = { createRequest, getMyRequests, updateRequest, deleteRequest };
const requestsService =
require("../services/requests.service");

// ============================
// 📩 CREATE REQUEST
// ============================
exports.createRequest =
async (req, res) => {
  try {

    const data =
      await requestsService
        .createRequest(
          req.body
        );

    return res
      .status(201)
      .json({
        message:
          "Request created successfully",
        data
      });

  } catch (err) {

    return res
      .status(500)
      .json({
        message:
          err.message
      });

  }
};

// ============================
// 📥 GET REQUESTS
// ============================
exports.getRequests =
async (req, res) => {
  try {

    const data =
      await requestsService
        .getAllRequests();

    return res
      .status(200)
      .json({
        message:
          "Requests loaded",
        data
      });

  } catch (err) {

    return res
      .status(500)
      .json({
        message:
          err.message
      });

  }
};

// ============================
// ❌ DELETE REQUEST
// ============================
exports.deleteRequest =
async (req, res) => {
  try {

    const { id } =
      req.params;

    await requestsService
      .deleteRequest(
        id
      );

    return res
      .status(200)
      .json({
        message:
          "Request deleted"
      });

  } catch (err) {

    return res
      .status(500)
      .json({
        message:
          err.message
      });

  }
};