import express from "express";
import { checkAuth, login, logout, signup, updateProfile, sendOtp, verifyOtp, forgotPassword, resetPassword, deleteAccount, deleteChat } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.put("/update-profile", protectRoute, updateProfile);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword/", resetPassword);
router.get("/check", protectRoute, checkAuth);
router.delete("/account", protectRoute, deleteAccount);// OTP endpoints
router.delete("/chat/:otherUserId", protectRoute, deleteChat);


router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

router.post("/test", (req, res) => {
  console.log("Received Data:", req.body);
  res.json({ message: "Test route working!", received: req.body });
});

export default router;
