const multer = require('multer');
const path = require('path');
const config = require('../config/env');

// Store files in memory buffer for fast extraction without disk leftovers
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimetypes = ['application/pdf', 'text/plain', 'application/octet-stream'];

  if (allowedExtensions.includes(ext) || allowedMimetypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Format file tidak didukung. Hanya file PDF (.pdf) dan TXT (.txt) yang diperbolehkan.');
    error.statusCode = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE
  },
  fileFilter
});

module.exports = upload;
