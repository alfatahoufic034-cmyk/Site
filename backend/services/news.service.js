const supabase = require("../config/supabase");

// ============================
// 📰 CRÉER UNE NEWS
// ============================
exports.createNews = async (data) => {
  try {
    const { title, content, image } = data;

    const { data: result, error } = await supabase
      .from("news")
      .insert([
        {
          title,
          content,
          image
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
// 📥 LISTE NEWS
// ============================
exports.getAllNews = async () => {
  try {
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data;

  } catch (err) {
    throw new Error(err.message);
  }
};

// ============================
// 📄 UNE NEWS
// ============================
exports.getNewsById = async (id) => {
  try {
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;

  } catch (err) {
    throw new Error(err.message);
  }
};

// ============================
// ❌ SUPPRIMER NEWS
// ============================
exports.deleteNews = async (id) => {
  try {
    const { error } = await supabase
      .from("news")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return true;

  } catch (err) {
    throw new Error(err.message);
  }
};