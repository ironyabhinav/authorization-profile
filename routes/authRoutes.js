const express = require("express");
const Joi = require("joi");

const {
  signup,
  verifyOtp,
  resendOtp,
  login,
} = require("../controllers/authController");

const validate = require("../middleware/validate");
const otpLimiter = require("../middleware/otpLimiter");

const router = express.Router();

const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).max(100).required(),
});

const otpSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  otp: Joi.string().pattern(/^[0-9]{6}$/).required(),
});

const emailSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

router.post("/signup", otpLimiter, validate(signupSchema), signup);
router.post("/verify-otp", validate(otpSchema), verifyOtp);
router.post("/resend-otp", otpLimiter, validate(emailSchema), resendOtp);
router.post("/login", validate(loginSchema), login);

module.exports = router;
