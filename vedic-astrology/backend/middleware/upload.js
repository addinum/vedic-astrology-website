const multer = require('multer');
const path = require('path');
const fs = require('fs');

const makeStorage = (subfolder) => {
  const dir = path.join(__dirname, '..', 'uploads', subfolder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    }
  });
};

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ok = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
  if (ok) return cb(null, true);
  cb(new Error('Only image files (jpg, png, webp) are allowed'));
};

const pdfFilter = (req, file, cb) => {
  const ok = file.mimetype === 'application/pdf';
  if (ok) return cb(null, true);
  cb(new Error('Only PDF files are allowed'));
};

exports.uploadImage = multer({
  storage: makeStorage('gallery'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

exports.uploadPanchang = multer({
  storage: makeStorage('panchang'),
  fileFilter: pdfFilter,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB
});
