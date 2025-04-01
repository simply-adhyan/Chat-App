import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/message.model.js"; // adjust path as needed

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"]
  }
});

// used to store online users: {userId: socketId}
const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A User Connected", socket.id);
  
  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // Emit online users list to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("updateReceipt", async ({ messageId, status }) => {
    try {
      let updateField = {};
      if (status === "delivered") {
        updateField = { deliveredAt: new Date() };
      } else if (status === "seen") {
        // Retrieve the message first to check deliveredAt
        const message = await Message.findById(messageId);
        if (!message.deliveredAt) {
          updateField = { deliveredAt: new Date(), seenAt: new Date() };
        } else {
          updateField = { seenAt: new Date() };
        }
      } else {
        return; // Invalid status
      }
  
      const updatedMessage = await Message.findByIdAndUpdate(
        messageId,
        { $set: updateField },
        { new: true }
      );
  
      if (updatedMessage) {
        const senderSocketId = getReceiverSocketId(updatedMessage.senderId.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit("receiptUpdated", updatedMessage);
        }
      }
    } catch (error) {
      console.error("Error updating receipt:", error);
    }
  });
  
  
  socket.on("disconnect", () => {
    console.log("A User Disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
