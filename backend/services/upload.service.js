const path = require('path');
const fs = require('fs');

const allowed = ['.jpg', '.jpeg', '.png', '.pdf', '.docx'];

const ensureUploads = () => {
  const dir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const saveFile = async (file, userId) => {
  const uploads = ensureUploads();
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) throw { status: 400, message: 'File type not allowed' };
  const name = `${Date.now()}-${userId || 'anon'}-${file.originalname.replace(/[^a-z0-9.-]/gi, '_')}`;
  const dest = path.join(uploads, name);
  fs.renameSync(file.path, dest);
  return { filename: name, path: `/uploads/${name}`, size: file.size };
};

module.exports = { saveFile };
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