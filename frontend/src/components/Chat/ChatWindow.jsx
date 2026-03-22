import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import VideoCall from "./VideoCall";
import {
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Send,
  Image as ImageIcon,
  ArrowLeft,
  Loader2,
  Check,
  CheckCheck,
} from "lucide-react";
import IncomingCall from "./IncomingCall";
import { useCall } from "@/context/CallContext";
import { toast } from "sonner";

const ChatWindow = ({ chat, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const socket = useSocket();
  const scrollRef = useRef(null);

  const { initiateCall } = useCall();

  const otherUser = chat.participants.find((p) => p._id !== user._id);

  // Fetch Messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!chat) return;
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/chat/${chat._id}`,
          { withCredentials: true }
        );
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
      setLoading(false);
    };
    fetchMessages();
  }, [chat]);

  // Socket Listener
  useEffect(() => {
    if (!socket) return;

    const messageListener = (newMsg) => {
      if (newMsg.channel === chat._id) {
        setMessages((prev) => [...prev, newMsg]);
      }
    };

    socket.on("newMessage", messageListener);

    return () => {
      socket.off("newMessage", messageListener);
    };
  }, [socket, chat]);

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit("sendMessage", {
      content: newMessage,
      channelId: chat._id,
    });
    setNewMessage("");
  };

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-card md:rounded-tl-2xl overflow-hidden">
      {/* --- Header --- */}
      <div className="h-16 px-6 border-b border-border flex items-center justify-between bg-card shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="md:hidden p-2 -ml-2 text-muted-foreground hover:bg-accent rounded-full"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="relative">
            {otherUser.profileImage ? (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                <img
                  src={otherUser.profileImage}
                  alt={otherUser.firstName}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {otherUser?.firstName?.charAt(0).toUpperCase()}
              </div>
            )}

            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>

          <div>
            <h3 className="font-bold text-foreground">
              {otherUser?.firstName} {otherUser?.lastName}
            </h3>
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{" "}
              Active now
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <IconButton
            icon={<Phone size={18} />}
            onClick={() => initiateCall(otherUser, 'audio')}
          />
          <IconButton
            icon={<Video size={18} />}
            onClick={() => initiateCall(otherUser, "video")}
          />
          <IconButton icon={<MoreVertical size={18} />} />
        </div>
      </div>

      {/* --- Messages Area --- */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/20 space-y-6">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="text-center text-xs text-muted-foreground my-4 font-medium uppercase tracking-wider">
              Start of conversation
            </div>

            {messages.map((msg, index) => {
              const isMe = msg.sender._id === user._id;
              const isSequence =
                index > 0 && messages[index - 1].sender._id === msg.sender._id;

              return (
                <div
                  key={msg._id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} ${
                    isSequence ? "mt-1" : "mt-4"
                  }`}
                >
                  <div
                    className={`max-w-[80%] sm:max-w-[70%] flex flex-col ${
                      isMe ? "items-end" : "items-start"
                    }`}
                  >
                    {/* Bubble */}
                    <div
                      className={`
                        px-4 py-2.5 text-sm shadow-sm relative group
                        ${
                          isMe
                            ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                            : "bg-card border border-border text-foreground rounded-2xl rounded-tl-sm"
                        }
                      `}
                    >
                      {msg.content}

                      {/* Timestamp on Hover */}
                      <div
                        className={`
                        absolute bottom-0 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-1
                        ${
                          isMe
                            ? "right-full mr-2 text-muted-foreground"
                            : "left-full ml-2 text-muted-foreground"
                        }
                      `}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    {/* Status Icon (Read receipts logic goes here later) */}
                    {isMe && !isSequence && (
                      <span className="text-[10px] text-muted-foreground mt-1 mr-1 flex items-center gap-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        <CheckCheck size={12} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </>
        )}
      </div>

      {/* --- Input Area --- */}
      <div className="p-4 bg-card border-t border-border">
        <form
          onSubmit={handleSendMessage}
          className="flex items-end gap-2 bg-muted/30 p-2 rounded-2xl border border-border focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all"
        >
          <div className="flex gap-1 pb-1 pl-1">
            <InputButton icon={<Paperclip size={20} />} />
            <InputButton icon={<ImageIcon size={20} />} />
          </div>

          <textarea
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-foreground placeholder:text-muted-foreground resize-none py-2 px-1 max-h-32 min-h-11"
            placeholder="Type a message..."
            rows={1}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />

          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`
              p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center
              ${
                newMessage.trim()
                  ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:scale-105"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }
            `}
          >
            <Send size={18} className={newMessage.trim() ? "ml-0.5" : ""} />
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Helper Components for Clean Code ---

const IconButton = ({ icon, onClick }) => (
  <button
    onClick={onClick}
    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all"
  >
    {icon}
  </button>
);

const InputButton = ({ icon }) => (
  <button
    type="button"
    className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors"
  >
    {icon}
  </button>
);

export default ChatWindow;
