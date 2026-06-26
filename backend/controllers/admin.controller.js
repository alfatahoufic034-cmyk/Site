const adminService =
require("../services/admin.service");

// ============================
// 📊 DASHBOARD ADMIN
// ============================
exports.getDashboard =
async (req, res) => {

  try {

    const data =
      await adminService
        .getDashboardData();

    return res.status(200).json({
      message:
        "Dashboard loaded successfully",
      data
    });

  } catch (err) {

    return res.status(500).json({
      message:
        err.message ||
        "Server error"
    });

  }

};

// ============================
// 👥 LIST USERS
// ============================
exports.getAllUsers =
async (req, res) => {

  try {

    const users =
      await adminService
        .getAllUsers();

    return res.status(200).json({
      message:
        "Users list fetched",
      users
    });

  } catch (err) {

    return res.status(500).json({
      message:
        err.message ||
        "Server error"
    });

  }

};

// ============================
// ❌ DELETE USER
// ============================
exports.deleteUser =
async (req, res) => {

  try {

    const { id } =
      req.params;

    if (!id) {
      return res.status(400).json({
        message:
          "User ID required"
      });
    }

    await adminService
      .deleteUser(id);

    return res.status(200).json({
      message:
        "User deleted successfully"
    });

  } catch (err) {

    return res.status(500).json({
      message:
        err.message ||
        "Server error"
    });

  }

};