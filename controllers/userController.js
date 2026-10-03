const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const uploadToCloudinary = require("../utils/cloudinaryUpload");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch profile",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, mobile } = req.body;

    const updates = {};

    if (name !== undefined) updates.name = name;
    if (mobile !== undefined) updates.mobile = mobile;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile",
    });
  }
};

const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const oldPublicId = user.profileImage?.public_id;

    const result = await uploadToCloudinary(req.file.buffer);

    user.profileImage = {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };

    await user.save();

    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId, {
          resource_type: "image",
        });
      } catch (deleteError) {
        console.error("Old Cloudinary image deletion failed:", deleteError.message);
      }
    }

    return res.json({
      success: true,
      message: "Profile image uploaded successfully",
      profileImage: user.profileImage,
    });
  } catch (error) {
    console.error(error);

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Image must be 2MB or smaller",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to upload profile image",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfileImage,
};
