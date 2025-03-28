import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in Get Users for Sidebar Controller : ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;
        
        const messages = await Message.find({
        $or:[
            {senderId:myId,receiverId:userToChatId},
            {senderId:userToChatId,receiverId:myId}
        ]
    });
    res.status(200).json(messages)

} catch (error) {
    console.log("Error in GetMessages Controller : ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessages = async (req, res) => {
  try {
      const { text, image, location } = req.body; // location is now expected optionally
      const { id: receiverId } = req.params;
      const senderId = req.user._id;

      let imageUrl;
      if (image) {
          const uploadResponse = await cloudinary.uploader.upload(image);
          imageUrl = uploadResponse.secure_url;
      }

      const newMessage = new Message({
          senderId,
          receiverId,
          text,
          image: imageUrl,
          location: location || null, // include location if provided
      });
      await newMessage.save();

      // Real-time notification using socket.io
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
          io.to(receiverSocketId).emit("newMessage", newMessage);
      }

      res.status(201).json(newMessage);

  } catch (error) {
      console.log("Error in SendMessages Controller:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
  }
};


export const updateMessageReceipt = async (req, res) => {
  try {
    const { messageId, status } = req.body; // status should be 'delivered', 'received', or 'seen'
    let updateField = {};

    switch (status) {
      case "delivered":
        updateField = { deliveredAt: new Date() };
        break;
      case "received":
        updateField = { receivedAt: new Date() };
        break;
      case "seen":
        updateField = { seenAt: new Date() };
        break;
      default:
        return res.status(400).json({ message: "Invalid status provided" });
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { $set: updateField },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error("Error updating message receipt:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
