import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

// Initialize Nodemailer transporter once.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// -------------------------------------------------
// Helper Functions
// -------------------------------------------------

// Generate a random 6-digit OTP.
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Standardized error handler.
const handleError = (res, message, status = 500) =>
  res.status(status).json({ message });

// Helper to verify OTP token.
const verifyOtpToken = (otpToken, email, otp) => {
  const decoded = jwt.verify(otpToken, process.env.OTP_SECRET);
  if (decoded.email !== email || decoded.otp !== otp) {
    throw new Error("Invalid OTP");
  }
};

// -------------------------------------------------
// OTP Controllers Using JWT (Stateless)
// -------------------------------------------------

/**
 * Send OTP to the provided email.
 */
export const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  // Optional: Check if the email is already registered (for signup OTPs).
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already registered. Please login." });
    }
  } catch (error) {
    console.error("Error checking existing user:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }

  const otp = generateOtp();
  const payload = { email, otp };
  const otpToken = jwt.sign(payload, process.env.OTP_SECRET, { expiresIn: "5m" });

  const mailOptions = {
    from: `"Your App" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
    // Optionally, use HTML:
    // html: `<p>Your OTP code is <strong>${otp}</strong>. It is valid for 5 minutes.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    // Return the OTP token so it can be used later for verification.
    return res.status(200).json({ message: "OTP sent successfully", otpToken });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return handleError(res, "Failed to send OTP");
  }
};

/**
 * Verify the provided OTP using JWT.
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

// -------------------------------------------------
// Authentication Controllers
// -------------------------------------------------

/**
 * Signup new user.
 * Requires fullName, email, password, otp, and otpToken.
 * The OTP is verified via JWT before proceeding.
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
    // Verify OTP using JWT.
    try {
      verifyOtpToken(otpToken, email, otp);
    } catch (err) {
      return res.status(400).json({ message: "OTP token is invalid or expired" });
    }

    // Check if user already exists.
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    // Hash the password.
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save the new user.
    const newUser = new User({ fullName, email, password: hashedPassword });
    await newUser.save();

    // Generate JWT token and send response.
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

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid Credentials" });

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

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logged Out Successfully" });
  } catch (error) {
    console.error("Error in Logout Controller:", error.message);
    return handleError(res, "Internal Server Error");
  }
};

export const updateProfile = async (req, res) => {
  const { profilePic } = req.body;
  const userId = req.user._id;

  if (!profilePic)
    return res.status(400).json({ message: "Profile picture is required" });
  if (!/^data:image\/(png|jpe?g|gif);base64,/.test(profilePic)) {
    return res.status(400).json({
      message: "Invalid image format. Only PNG, JPG, and GIF are allowed.",
    });
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

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateProfile controller:", error.message);
    return handleError(res, "Internal Server Error");
  }
};

export const checkAuth = (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({
        message: "Unauthorized - User not authenticated",
      });
    return res.status(200).json(req.user);
  } catch (error) {
    console.error("Error in checkAuth controller:", error.message);
    return handleError(res, "Internal Server Error");
  }
};
