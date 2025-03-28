import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Check, CheckCheck, MapPin } from "lucide-react";
import { formatMessageTime } from "../lib/utils";

const MessageItem = ({ message, authUser, selectedUser }) => {
  // Defensive check to ensure message is defined
  if (!message) return null;

  const socket = useAuthStore((state) => state.socket);
  const messageRef = useRef(null);

  // Only observe messages not sent by the current user and not already marked as seen
  useEffect(() => {
    if (message.senderId === authUser._id || message.seenAt) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            socket.emit("updateReceipt", {
              messageId: message._id,
              status: "seen",
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (messageRef.current) {
      observer.observe(messageRef.current);
    }

    return () => {
      if (messageRef.current) observer.unobserve(messageRef.current);
    };
  }, [message, authUser, socket]);

  // Determine which icon to display for read receipts (only for messages sent by the current user)
  let receiptIcon = null;
  if (message.senderId === authUser._id) {
    if (!message.deliveredAt) {
      receiptIcon = <Check size={16} color="grey" />;
    } else if (message.deliveredAt && !message.seenAt) {
      receiptIcon = <CheckCheck size={16} color="grey" />;
    } else if (message.deliveredAt && message.seenAt) {
      receiptIcon = <CheckCheck size={16} color="blue" />;
    }
  }

  // If the message has location data, construct a Google Maps URL
  const googleMapsLink = message.location
    ? `https://www.google.com/maps/search/?api=1&query=${message.location.latitude},${message.location.longitude}`
    : null;

  return (
    <div
      ref={messageRef}
      className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
    >
      <div className="chat-image avatar">
        <div className="size-10 rounded-full border">
          <img
            src={
              message.senderId === authUser._id
                ? authUser.profilePic || "/avatar.png"
                : selectedUser.profilePic || "/avatar.png"
            }
            alt="profile pic"
          />
        </div>
      </div>

      <div className="chat-header mb-1">
        <time className="text-xs opacity-50 ml-1">
          {formatMessageTime(message.createdAt)}
        </time>
      </div>

      <div className="chat-bubble flex flex-col relative">
        {/* Render image if available */}
        {message.image && (
          <img
            src={message.image}
            alt="Attachment"
            className="sm:max-w-[200px] rounded-md mb-2"
          />
        )}

        {/* Render text if available */}
        {message.text && <p>{message.text}</p>}

        {/* Render location as a clickable Google Maps link */}
        {message.location && (
          <div className="mt-2 p-2 rounded-md bg-base-200 flex items-center gap-2">
            <MapPin size={18} className="text-blue-600" />
            <a
              href={googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600 hover:text-blue-800"
            >
              {message.location.address
                ? message.location.address
                : `Open Location (${Number(message.location.latitude).toFixed(4)}, ${Number(message.location.longitude).toFixed(4)})`}
            </a>
          </div>
        )}

        {/* Render receipt icon for messages sent by the auth user */}
        {message.senderId === authUser._id && (
          <div className="absolute bottom-1 right-1">
            {receiptIcon}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
