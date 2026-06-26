const supabase = require("../config/supabase");

// ============================
// 📤 UPLOAD FILE
// ============================
exports.uploadFile = async (file) => {
  try {
    if (!file) {
      throw new Error("File is required");
    }

    const fileName =
      `${Date.now()}-${file.originalname}`;

    const { error } = await supabase.storage
      .from("uploads")
      .upload(
        fileName,
        file.buffer,
        {
          contentType: file.mimetype
        }
      );

    if (error) {
      throw error;
    }

    const {
      data
    } = supabase.storage
      .from("uploads")
      .getPublicUrl(fileName);

    return {
      fileName,
      url: data.publicUrl
    };

  } catch (err) {
    throw new Error(err.message);
  }
};