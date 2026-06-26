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