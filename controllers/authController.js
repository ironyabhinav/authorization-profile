const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const generateOtp = require("../utils/generateOtp");
const hashOtp = require("../utils/hashOtp");
const sendOtpEmail = require("../utils/sendOtpEmail");

const createOtp = () => {
  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  return { otp, otpHash, otpExpiresAt };
};

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email }).select("+password");

    if (user && user.isVerified) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const { otp, otpHash, otpExpiresAt } = createOtp();

    if (!user) {
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        otpHash,
        otpExpiresAt,
        otpLastSentAt: new Date(),
      });
    } else {
      user.name = name;
      user.password = hashedPassword;
      user.otpHash = otpHash;
      user.otpExpiresAt = otpExpiresAt;
      user.otpLastSentAt = new Date();
      await user.save();
    }

    await sendOtpEmail(email, otp);

    return res.status(201).json({
      success: true,
      message: "Signup successful. OTP sent to your email.",
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to complete signup",
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select("+otpHash +otpExpiresAt");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otpHash || user.otpHash !== hashOtp(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    user.isVerified = true;
    user.otpHash = null;
    user.otpExpiresAt = null;
    user.otpLastSentAt = null;

    await user.save();

    return res.json({
      success: true,
      message: "Account verified successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify OTP",
    });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }).select("+otpHash +otpExpiresAt");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account is already verified",
      });
    }

    const { otp, otpHash, otpExpiresAt } = createOtp();

    user.otpHash = otpHash;
    user.otpExpiresAt = otpExpiresAt;
    user.otpLastSentAt = new Date();

    await user.save();
    await sendOtpEmail(email, otp);

    return res.json({
      success: true,
      message: "New OTP sent successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to resend OTP",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your account first",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to login",
    });
  }
};

module.exports = {
  signup,
  verifyOtp,
  resendOtp,
  login,
};
