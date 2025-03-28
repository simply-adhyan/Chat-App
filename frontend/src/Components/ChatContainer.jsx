import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader.jsx";
import MessageInput from "./MessageInput.jsx";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import MessageItem from "./MessageItem";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    // If no user is selected, do nothing
    if (!selectedUser) return;

    // Fetch old messages from server
    getMessages(selectedUser._id);

    // Listen for new messages specifically from the selected user
    subscribeToMessages(selectedUser._id);

    // Cleanup on unmount or user change
    return () => unsubscribeFromMessages();
  }, [
    selectedUser, // changed from selectedUser._id to selectedUser so the effect re-runs whenever selectedUser changes
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  // Auto-scroll
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageItem
            key={message._id}
            message={message}
            authUser={authUser}
            selectedUser={selectedUser}
          />
        ))}
        <div ref={messageEndRef} />
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
