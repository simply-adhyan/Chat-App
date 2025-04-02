import React, { useState } from 'react';
import { MoreVertical, X } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, getMessages } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleClearChat = async () => {
    setIsConfirmModalOpen(false);
    try {
      console.log("Clearing chat for user ID:", selectedUser._id);
      // Adjust the endpoint below if your router is mounted under a different base URL.
      const response = await axiosInstance.delete(`/auth/chat/${selectedUser._id}`);

      if (response.status === 200) {
        toast.success(response.data.message || "Chat cleared successfully");
        getMessages([selectedUser._id]);
      }
    } catch (error) {
      console.error("Error clearing chat:", error);
      toast.error("Failed to clear chat");
    }
  };

  return (
    <>
      <div className="p-2.5 border-b border-base-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="size-10 rounded-full relative">
                <img
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt={selectedUser.fullName}
                />
              </div>
            </div>
            <div>
              <h3 className="font-medium">{selectedUser.fullName}</h3>
              <p className="text-sm text-base-content/70">
                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle">
                <MoreVertical className="w-6 h-6" />
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow bg-base-300 rounded-box w-52"
              >
                <li>
                  <button onClick={() => setIsConfirmModalOpen(true)}>
                    Clear Chat
                  </button>
                </li>
              </ul>
            </div>
            <button onClick={() => setSelectedUser(null)}>
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {isConfirmModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Clear Chat</h3>
            <p className="py-4">
              Are you sure you want to clear this chat? This action cannot be undone.
            </p>
            <div className="modal-action">
              <button className="btn btn-outline" onClick={() => setIsConfirmModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-error" onClick={handleClearChat}>
                Clear Chat
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setIsConfirmModalOpen(false)}></div>
        </div>
      )}
    </>
  );
};

export default ChatHeader;
