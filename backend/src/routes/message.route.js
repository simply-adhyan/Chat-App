import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessages } from "../controllers/message.controller.js";



const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id",protectRoute,sendMessages)

router.post("/test", (req, res) => {
    console.log("Received Data:", req.body);
    res.json({ message: "Test route working!", received: req.body });
});

export default router;