import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, Trash2, MapPin, Mic, StopCircle } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null); // New ref to store the stream
  const { sendMessage } = useChatStore();

  // Handle Image Change
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

  // Handle Location Sharing
  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude, address: "" });
        toast.success("Location shared successfully");
      },
      (error) => {
        toast.error("Unable to retrieve location");
        console.error("Error getting location:", error);
      },
      { enableHighAccuracy: true }
    );
  };

  const removeLocation = () => {
    setLocation(null);
  };

  // Handle Audio Recording using MediaRecorder API
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream; // Save the stream reference
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/mp3" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      console.error("Error starting audio recording", error);
      toast.error("Could not start recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      // Stop all tracks of the stream to turn off the mic
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      setIsRecording(false);
      toast.success("Recording stopped");
    }
  };

  const removeAudio = () => {
    setAudioBlob(null);
    setAudioUrl(null);
  };

  // Ensure recording stops if the component unmounts
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      }
    };
  }, [isRecording]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview && !location && !audioBlob) return;

    let audioData = null;
    if (audioBlob) {
      // Convert audio blob to base64 string for sending
      audioData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });
    }

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
        location,
        audio: audioData,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      setLocation(null);
      removeAudio();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-4 w-full">
      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3">
          <div className="chat chat-end">
            <div className="chat-bubble relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-base-300"
              />
              <button
                onClick={removeImage}
                className="absolute -top-1 -right-1 btn btn-xs btn-ghost text-red-500"
                type="button"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Preview */}
      {location && (
        <div className="mb-3">
          <div className="chat chat-end">
            <div className="chat-bubble flex items-center gap-2">
              <MapPin size={20} className="text-blue-600" />
              <p className="text-sm">
                Shared Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </p>
              <button
                onClick={removeLocation}
                className="ml-auto btn btn-xs btn-ghost text-red-500"
                type="button"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audio Preview */}
      {audioUrl && (
        <div className="mb-3">
          <div className="chat chat-end">
            <div className="chat-bubble flex items-center gap-2">
              <audio controls src={audioUrl} className="max-w-xs" />
              <button
                onClick={removeAudio}
                className="ml-auto btn btn-xs btn-ghost text-red-500"
                type="button"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
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
          {/* Location Button */}
          <button
            type="button"
            className="hidden sm:flex btn btn-circle text-zinc-400"
            onClick={handleShareLocation}
          >
            <MapPin size={20} />
          </button>
          {/* Audio Recording Button */}
          {isRecording ? (
            <button
              type="button"
              className="hidden sm:flex btn btn-circle text-red-500"
              onClick={stopRecording}
            >
              <StopCircle size={20} />
            </button>
          ) : (
            <button
              type="button"
              className="hidden sm:flex btn btn-circle text-zinc-400"
              onClick={startRecording}
            >
              <Mic size={20} />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !imagePreview && !location && !audioBlob}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
