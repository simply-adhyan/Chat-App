import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

// In-memory OTP store (for demo purposes)
const otpStore = {};

/**
 * Send OTP to the provided email.
 */
export const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP with an expiry time (5 minutes)
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

  // Configure your SMTP transporter (update these with your own SMTP details or use env variables)
  const transporter = nodemailer.createTransport({
    service:'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"Your App" <${process.env.SMTP_USER || "adhyanagarwal490@gmail.com"}>`,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
    // html: `<p>Your OTP code is <strong>${otp}</strong>. It is valid for 5 minutes.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

/**
 * Verify the provided OTP.
 */
export const verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  const record = otpStore[email];
  if (!record) {
    return res.status(400).json({ message: "OTP not found. Please request a new one." });
  }

  // Check for expiration
  if (Date.now() > record.expires) {
    delete otpStore[email];
    return res.status(400).json({ message: "OTP expired. Please request a new one." });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP. Please try again." });
  }

  // OTP verified successfully; remove it from the store
  delete otpStore[email];
  res.status(200).json({ message: "OTP verified successfully" });
};

/**
 * Signup new user.
 * Optionally, you can require OTP verification before creating the account.
 */
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    console.log("Received Request Body:", req.body);
    if (![fullName, email, password].every(Boolean)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // Generate JWT token here
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid User Data" });
    }
  } catch (error) {
    console.log("Error in signup Controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

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
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login Controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logged Out Successfully" });
  } catch (error) {
    console.log("Error in Logout Controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  const { profilePic } = req.body;
  const userId = req.user._id;

  try {
    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    // Validate that the image is Base64
    if (!/^data:image\/(png|jpe?g|gif);base64,/.test(profilePic)) {
      return res.status(400).json({ message: "Invalid image format. Only PNG, JPG, and GIF are allowed." });
    }

    let uploadResponse;
    try {
      uploadResponse = await cloudinary.uploader.upload(profilePic, {
        folder: "user_profiles", // Organize uploads into a specific folder
        allowed_formats: ["jpg", "jpeg", "png", "gif"],
        transformation: [{ width: 500, height: 500, crop: "limit" }],
      });
    } catch (cloudinaryError) {
      console.error("Cloudinary upload error:", cloudinaryError);
      return res.status(500).json({ message: "Image upload failed. Please try again later." });
    }

    // Update user profile picture in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { profilePic: uploadResponse.secure_url } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateProfile controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - User not authenticated" });
    }
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in CheckAuth controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
