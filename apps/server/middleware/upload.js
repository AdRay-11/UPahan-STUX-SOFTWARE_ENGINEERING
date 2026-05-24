const multer = require('multer');

const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  if (allowed.test(file.mimetype) && allowed.test(file.originalname.split('.').pop().toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const docFilter = (req, file, cb) => {
  const allowedMime = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  const allowedExt  = /jpeg|jpg|png|pdf/;
  const ext = file.originalname.split('.').pop().toLowerCase();
  if (allowedMime.includes(file.mimetype) && allowedExt.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and PDF files are accepted.'), false);
  }
};

const imageOnlyFilter = (req, file, cb) => {
  const allowedMime = ['image/jpeg', 'image/jpg', 'image/png'];
  const allowedExt  = /jpeg|jpg|png/;
  const ext = file.originalname.split('.').pop().toLowerCase();
  if (allowedMime.includes(file.mimetype) && allowedExt.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG and PNG images are accepted.'), false);
  }
};

const unitPhotoUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});

const maintenancePhotoUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});

const paymentProofUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: docFilter,
});

const documentIdUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageOnlyFilter,
}).fields([
  { name: 'frontImage', maxCount: 1 },
  { name: 'backImage',  maxCount: 1 },
]);

const contractUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: docFilter,
}).single('contractFile');

const avatarUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single('avatar');

const wrapUpload = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (!err) return next();
    const msg = err instanceof multer.MulterError
      ? err.message
      : (err.message || 'File upload failed.');
    return res.status(400).json({ success: false, message: msg });
  });
};

module.exports = {
  unitPhotoUpload, maintenancePhotoUpload, paymentProofUpload,
  documentIdUpload, contractUpload, avatarUpload,
  wrapUpload,
};
