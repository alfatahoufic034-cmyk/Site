const supabase =
require("../config/supabase");

// ============================
// 📊 DASHBOARD DATA
// ============================
exports.getDashboardData =
async () => {

  try {

    const {
      data: users,
      error: usersError
    } = await supabase
      .from("users")
      .select("*");

    if (usersError) {
      throw usersError;
    }

    return {
      totalUsers:
        users ? users.length : 0,
      users: users || []
    };

  } catch (err) {

    throw new Error(
      err.message ||
      "Error fetching dashboard data"
    );

  }

};

// ============================
// 👥 GET ALL USERS
// ============================
exports.getAllUsers =
async () => {

  try {

    const {
      data,
      error
    } = await supabase
      .from("users")
      .select("*")
      .order("created_at", {
        ascending: false
      });

    if (error) {
      throw error;
    }

    return data || [];

  } catch (err) {

    throw new Error(
      err.message ||
      "Error fetching users"
    );

  }

};

// ============================
// ❌ DELETE USER
// ============================
exports.deleteUser =
async (id) => {

  try {

    if (!id) {
      throw new Error(
        "User ID required"
      );
    }

    const {
      error
    } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return true;

  } catch (err) {

    throw new Error(
      err.message ||
      "Error deleting user"
    );

  }

};