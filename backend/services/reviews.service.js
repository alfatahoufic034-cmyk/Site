const supabase = require("../config/supabase");

// ============================
// ⭐ AJOUTER UN AVIS
// ============================
exports.addReview = async (data) => {
  try {
    const { name, rating, comment } = data;

    const { data: result, error } = await supabase
      .from("reviews")
      .insert([
        {
          name,
          rating,
          comment
        }
      ])
      .select();

    if (error) throw error;

    return result;

  } catch (err) {
    throw new Error(err.message);
  }
};

// ============================
// 📥 LISTE DES AVIS
// ============================
exports.getAllReviews = async () => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data;

  } catch (err) {
    throw new Error(err.message);
  }
};

// ============================
// ❌ SUPPRIMER AVIS
// ============================
exports.deleteReview = async (id) => {
  try {
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return true;

  } catch (err) {
    throw new Error(err.message);
  }
};