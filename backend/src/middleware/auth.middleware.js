import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    // Look for the token in cookies or the Authorization header
    const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized - No token provided",
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized - Invalid token",
      });
    }

    // Check the token payload for the correct property
    // Use 'userId' if you set it that way, or 'id' if that's what you used in generateToken
    const userId = decoded.userId || decoded.id;
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized - Token missing user identifier",
      });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in Middleware:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
