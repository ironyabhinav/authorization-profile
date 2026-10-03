const transporter = require("../config/mailer");

const sendOtpEmail = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your MLCOE Verification OTP",
    text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
  });
};

module.exports = sendOtpEmail;
