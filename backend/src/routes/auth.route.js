import express from "express";
import {checkAuth, login, logout, signup ,updateProfile} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";


const router = express.Router()

router.post("/signup",signup)

router.post("/login",login)

router.post("/logout",logout)

router.put("/update-profile", protectRoute, updateProfile)

router.get("/check",protectRoute,checkAuth)



router.post("/test", (req, res) => {
    console.log("Received Data:", req.body);
    res.json({ message: "Test route working!", received: req.body });
});
export default router;