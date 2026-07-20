const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticate } = require('../middleware/auth.middleware');
const uploadsController = require('../controllers/uploads.controller');

const tmpDir = path.join(__dirname, '..', 'tmp');
const fs = require('fs');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const storage = multer.diskStorage({ destination: tmpDir, filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`) });

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpg|jpeg|png|pdf|docx/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) return cb(null, true);
    cb(new Error('File type not allowed'));
  }
});

router.post('/', authenticate, upload.single('file'), uploadsController.upload);

module.exports = router;
module.exports = router;