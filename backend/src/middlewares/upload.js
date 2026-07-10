// Multer configuration for product image uploads.
// Images are stored locally in src/public/uploads and served as static files.

const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Where and how to name uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to avoid collisions between products
    // e.g. 3f2a1b9c8d7e6f5a-1699999999999.jpg
    const uniqueSuffix = `${crypto.randomBytes(8).toString('hex')}-${Date.now()}`;
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${extension}`);
  },
});

// Only accept image files (jpg, jpeg, png, webp)
function fileFilter(req, file, cb) {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const isValidExt = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const isValidMime = allowedTypes.test(file.mimetype);

  if (isValidExt && isValidMime) {
    return cb(null, true);
  }
  cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'));
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max per image
});

module.exports = upload;