const multer = require("multer");

const storage = multer.memoryStorage();

const allowedTypes = ["image/jpeg", "image/png"];

const fileFilter = (req, file, cb) => {
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only JPG, JPEG and PNG images are allowed."));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter,
});

module.exports = upload;
