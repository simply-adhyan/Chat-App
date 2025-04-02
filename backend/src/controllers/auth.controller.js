import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

// -----------------------------------------
// Nodemailer Setup
// -----------------------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// -----------------------------------------
// Helper Functions
// -----------------------------------------

// Generate a random 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Standardized error handler
const handleError = (res, message, status = 500) => {
  return res.status(status).json({ message });
};

// Verify OTP token
const verifyOtpToken = (otpToken, email, otp) => {
  const decoded = jwt.verify(otpToken, process.env.OTP_SECRET);
  if (decoded.email !== email || decoded.otp !== otp) {
    throw new Error("Invalid OTP");
  }
};

// Send a welcome email after successful signup
const sendWelcomeEmail = async (email, fullName) => {
  const mailOptions = {
    from: `Your App <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Welcome to Our Platform! 🎉",
    html: `
      <h2>Welcome, ${fullName}!</h2>
      <p>We're thrilled to have you join us. Here’s what you can do next:</p>
      <ul>
        <li>🔹 Set up your profile</li>
        <li>🔹 Explore our features</li>
        <li>🔹 Connect with other users</li>
      </ul>
      <p>If you have any questions, feel free to reach out.</p>
      <p>Best regards,<br/>Your App Team</p>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// -----------------------------------------
// OTP Controllers (Stateless JWT-based)
// -----------------------------------------

/**
 * 1. Send OTP to the provided email (for signup).
 *    - If email is already registered, return an error.
 *    - Otherwise, generate a 6-digit OTP and a short-lived JWT (5m).
 */
export const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already registered. Please login." });
    }

    const otp = generateOtp();
    const payload = { email, otp };
    const otpToken = jwt.sign(payload, process.env.OTP_SECRET, {
      expiresIn: "5m",
    });

    // Send OTP via email
    const mailOptions = {
      from: `Your App <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "OTP sent successfully", otpToken });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return handleError(res, "Failed to send OTP");
  }
};

/**
 * 2. Verify the provided OTP using the JWT.
 */
export const verifyOtp = (req, res) => {
  const { email, otp, otpToken } = req.body;
  if (!email || !otp || !otpToken) {
    return res
      .status(400)
      .json({ message: "Email, OTP, and OTP token are required" });
  }

  try {
    verifyOtpToken(otpToken, email, otp);
    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error.message);
    return res.status(400).json({ message: "OTP token is invalid or expired" });
  }
};

// -----------------------------------------
// Auth Controllers
// -----------------------------------------

/**
 * Signup a new user.
 * - Requires fullName, email, password, otp, otpToken
 * - Verifies OTP token before creating the user
 */
export const signup = async (req, res) => {
  const { fullName, email, password, otp, otpToken } = req.body;

  if (![fullName, email, password].every(Boolean)) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (!otp || !otpToken) {
    return res
      .status(400)
      .json({ message: "OTP and OTP token are required for signup" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    // Verify OTP
    try {
      verifyOtpToken(otpToken, email, otp);
    } catch (err) {
      return res.status(400).json({ message: "OTP token is invalid or expired" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save the new user
    const newUser = new User({ fullName, email, password: hashedPassword });
    await newUser.save();

    // Send welcome email & generate session token
    await sendWelcomeEmail(email, fullName);
    generateToken(newUser._id, res);

    return res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
  } catch (error) {
    console.error("Error in signup Controller:", error.message);
    return handleError(res, "Internal Server Error");
  }
};

/**
 * Login an existing user.
 * - Checks email/password
 * - On success, sets a JWT in the cookie
 */
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    generateToken(user._id, res);
    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error in login Controller:", error.message);
    return handleError(res, "Internal Server Error");
  }
};

/**
 * Logout by clearing the JWT cookie
 */
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logged Out Successfully" });
  } catch (error) {
    console.error("Error in Logout Controller:", error.message);
    return handleError(res, "Internal Server Error");
  }
};

/**
 * Update user profile (profile pic in this case)
 * - Requires base64 image data in `profilePic`
 */
export const updateProfile = async (req, res) => {
  const { profilePic } = req.body;
  const userId = req.user._id;

  if (!profilePic) {
    return res.status(400).json({ message: "Profile picture is required" });
  }
  if (!/^data:image\/(png|jpe?g|gif);base64,/.test(profilePic)) {
    return res
      .status(400)
      .json({ message: "Invalid image format. Only PNG, JPG, and GIF are allowed." });
  }

  try {
    const uploadResponse = await cloudinary.uploader.upload(profilePic, {
      folder: "user_profiles",
      allowed_formats: ["jpg", "jpeg", "png", "gif"],
      transformation: [{ width: 500, height: 500, crop: "limit" }],
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { profilePic: uploadResponse.secure_url } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateProfile controller:", error.message);
    return handleError(res, "Internal Server Error");
  }
};

/**
 * Check auth status
 * - If `req.user` is present, user is authenticated
 */
export const checkAuth = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized - User not authenticated",
      });
    }
    return res.status(200).json(req.user);
  } catch (error) {
    console.error("Error in checkAuth controller:", error.message);
    return handleError(res, "Internal Server Error");
  }
};

/**
 * Forgot password (sends reset link via email)
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate password reset token (expires in 15 minutes)
    const resetToken = jwt.sign({ email }, process.env.RESET_SECRET, {
      expiresIn: "15m",
    });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Send reset email
    const mailOptions = {
      from: `Your App <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password. This link expires in 15 minutes.</p>
        <a href="${resetLink}" target="_blank" rel="noopener noreferrer">Reset Password</a>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res
      .status(200)
      .json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error("Forgot Password Error:", error.message);
    return handleError(res, "Internal Server Error");
  }
};

/**
 * Reset password (uses token from forgotPassword)
 */
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.RESET_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password and update the user record
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Return a response that instructs the user to re-login.
    return res.status(200).json({ message: "Password reset successful. Please log in with your new password." });
  } catch (error) {
    console.error("Reset Password Error:", error.message);
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};

// import User from "../models/user.model.js";
import Message from "../models/message.model.js";

export const deleteAccount = async (req, res) => {
  const userId = req.user._id; // set by protectRoute middleware
  try {
    // Optionally delete all messages sent or received by the user
    await Message.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] });
    
    // Delete the user account
    await User.findByIdAndDelete(userId);
    
    res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    console.error("Error deleting account:", error.message);
    res.status(500).json({ message: "Failed to delete account." });
  }
};


export const deleteChat = async (req, res) => {
  const userId = req.user._id;
  const { otherUserId } = req.params; // the id of the other user in the chat
  try {
    const result = await Message.deleteMany({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    });
    res.status(200).json({ message: "Chat deleted successfully.", deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Error deleting chat:", error.message);
    res.status(500).json({ message: "Failed to delete chat." });
  }
};
