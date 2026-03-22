import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bell, Menu, MessageSquare } from "lucide-react";

// Components
import Sidebar from "@/components/Layout/Sidebar";
import ChatSidebar from "@/components/Chat/ChatSidebar";
import ChatWindow from "@/components/Chat/ChatWindow";
import NotificationPanel from "@/components/Dashboard/NotificationPanel";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import SEO from "@/components/SEO";
import ThemeToggle from "@/components/ui/ThemeToggle";

const Chat = () => {
  const { toggleNotificationPanel, notifications } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const socket = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    const fetchAllEmployee = async () => {
      if (!user?._id) return;
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/employee/all-employee`,
          { withCredentials: true }
        );
        const filteredEmployees = res.data.filter(
          (emp) => emp._id !== user._id
        );
        setEmployeeList(filteredEmployees);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchAllEmployee();
  }, [user]);

  useEffect(() => {
    if (selectedChat && socket) {
      socket.emit("joinChat", selectedChat._id);
    }
  }, [selectedChat, socket]);

  const handleSelectedChat = async (employee) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chat`,
        { userId: employee._id },
        { withCredentials: true }
      );
      setSelectedChat(res.data);
    } catch (error) {
      console.error("Error accessing chat:", error);
    }
  };

  return (
    <>
      <SEO
        title="Team Chat & Collaboration"
        description="Real-time secure messaging for your organization."
        keywords="team chat, enterprise messaging, work collaboration"
      />
      <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        <div className="flex-1 flex flex-col h-full relative">
          {/* Header */}
          <header className="bg-card border-b border-border h-16 flex items-center justify-between px-4 lg:px-8 shrink-0 z-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-muted-foreground hover:bg-accent rounded-lg transition-colors"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="text-primary" size={24} /> Messages
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={toggleNotificationPanel}
                className="relative p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors"
              >
                <Bell size={22} />
                {notifications?.length > 0 && (
                  <span className="absolute top-1.5 right-2 h-2.5 w-2.5 bg-rose-500 rounded-full ring-2 ring-card animate-pulse"></span>
                )}
              </button>
            </div>
          </header>

          {/* Chat Content Area */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Contact List Sidebar */}
            <div
              className={`
              absolute inset-0 z-10 bg-card md:static md:w-80 md:border-r border-border transition-transform duration-300
              ${
                selectedChat
                  ? "-translate-x-full md:translate-x-0"
                  : "translate-x-0"
              }
            `}
            >
              <ChatSidebar
                employeeList={employeeList}
                onSelectChat={handleSelectedChat}
                activeChatId={selectedChat?._id}
              />
            </div>

            {/* Conversation Window */}
            <div className="flex-1 flex flex-col w-full bg-background h-full relative">
              {selectedChat ? (
                <ChatWindow
                  key={selectedChat._id}
                  chat={selectedChat}
                  onBack={() => setSelectedChat(null)}
                />
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        </div>

        <NotificationPanel />
      </div>
    </>
  );
};

const EmptyState = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-0 md:opacity-100 transition-opacity duration-500">
    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-sm">
      <MessageSquare className="h-10 w-10 text-primary" />
    </div>
    <h3 className="text-2xl font-bold text-foreground mb-2">Your Messages</h3>
    <p className="text-muted-foreground max-w-sm">
      Select a colleague from the sidebar to start collaborating, sharing files,
      and discussing projects.
    </p>
  </div>
);

export default Chat;
