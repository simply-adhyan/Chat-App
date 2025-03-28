import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, MapPin } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [location, setLocation] = useState(null); // New state for location
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // New function to handle location sharing
  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Here you could use a reverse geocoding API to get an address (free options available), but for now we use coordinates only
        setLocation({ latitude, longitude, address: "" });
        toast.success("Location shared successfully");
      },
      (error) => {
        toast.error("Unable to retrieve location");
        console.error("Error getting location:", error);
      }
    );
  };

  const removeLocation = () => {
    setLocation(null);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview && !location) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
        location, // include location data if available
      });

      // Clear form
      setText("");
      setImagePreview(null);
      setLocation(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-4 w-full">
      {/* Preview for Image */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {/* Preview for Location */}
      {location && (
        <div className="mb-3 flex items-center gap-2 p-2 border rounded-lg bg-gray-100">
          <MapPin size={20} className="text-blue-500" />
          <div className="text-sm">
            Shared Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </div>
          <button
            onClick={removeLocation}
            className="ml-2 text-red-500"
            type="button"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle ${
              imagePreview ? "text-emerald-500" : "text-zinc-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
          {/* New Location Button */}
          <button
            type="button"
            className="hidden sm:flex btn btn-circle text-zinc-400"
            onClick={handleShareLocation}
          >
            <MapPin size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !imagePreview && !location}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
