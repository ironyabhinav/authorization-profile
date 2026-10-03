const express = require("express");
const Joi = require("joi");

const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const validate = require("../middleware/validate");

const {
  getProfile,
  updateProfile,
  uploadProfileImage,
} = require("../controllers/userController");

const router = express.Router();

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50),
  mobile: Joi.string().trim().pattern(/^[0-9]{10}$/),
}).min(1);

router.get("/profile", auth, getProfile);

router.put(
  "/profile",
  auth,
  validate(updateProfileSchema),
  updateProfile
);

router.put(
  "/profile/image",
  auth,
  upload.single("image"),
  uploadProfileImage
);

module.exports = router;
