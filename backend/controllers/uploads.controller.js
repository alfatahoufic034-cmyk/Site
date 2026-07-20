const uploadService = require('../services/upload.service');

const upload = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const info = await uploadService.saveFile(req.file, req.user && req.user.id);
    return res.status(201).json({ file: info });
  } catch (err) {
    next(err);
  }
};

module.exports = { upload };
module.exports = { upload };