// models/message.model.js
import mongoose from "mongoose";
const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String },
    image: { type: String, default: "" },
    location: {
      type: {
        latitude: Number,
        longitude: Number,
        address: { type: String, default: "" },
      },
      default: null,
    },
    audio: { type: String, default: "" },
    deliveredAt: { type: Date, default: null },
    receivedAt: { type: Date, default: null },
    seenAt: { type: Date, default: null },
  },
  { timestamps: true }
);


const Message = mongoose.model("Message", messageSchema);
export default Message;
