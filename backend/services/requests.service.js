const supabase = require("../config/supabase");

// ============================
// 📩 CREATE REQUEST
// ============================
exports.createRequest = async (data) => {
  try {
    const {
      fullName,
      email,
      phone,
      service,
      message
    } = data;

    const { data: result, error } =
      await supabase
        .from("requests")
        .insert([
          {
            full_name: fullName,
            email,
            phone,
            service,
            message
          }
        ])
        .select();

    if (error) {
      throw error;
    }

    return result;

  } catch (err) {
    throw new Error(err.message);
  }
};

// ============================
// 📥 GET ALL REQUESTS
// ============================
exports.getAllRequests = async () => {
  try {

    const { data, error } =
      await supabase
        .from("requests")
        .select("*")
        .order(
          "created_at",
          {
            ascending: false
          }
        );

    if (error) {
      throw error;
    }

    return data;

  } catch (err) {
    throw new Error(err.message);
  }
};

// ============================
// ❌ DELETE REQUEST
// ============================
exports.deleteRequest = async (id) => {
  try {

    const { error } =
      await supabase
        .from("requests")
        .delete()
        .eq("id", id);

    if (error) {
      throw error;
    }

    return true;

  } catch (err) {
    throw new Error(err.message);
  }
};