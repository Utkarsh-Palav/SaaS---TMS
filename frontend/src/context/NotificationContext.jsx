import { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "./SocketContext";

const NotificationContext = createContext();

// Key for localStorage
const NOTIFICATIONS_STORAGE_KEY = "userNotifications";

// 2. Function to load notifications from localStorage
const loadNotifications = () => {
  try {
    const serializedNotifications = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return serializedNotifications ? JSON.parse(serializedNotifications) : [];
  } catch (error) {
    console.error("Could not load notifications from localStorage", error);
    return []; // Return empty array on error
  }
};

// 3. Function to save notifications to localStorage
const saveNotifications = (notifications) => {
  try {
    const serializedNotifications = JSON.stringify(notifications);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, serializedNotifications);
  } catch (error) {
    console.error("Could not save notifications to localStorage", error);
  }
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(loadNotifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const socket = useSocket();

  // 5. Use useEffect to save notifications whenever the state changes
  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  // Function to add a new notification
  const addNotification = (newNotification) => {
    setNotifications((prevNotifications) => [
      { ...newNotification, id: Date.now() },
      ...prevNotifications,
    ]);
  };

  useEffect(() => {
    if (!socket) return;

    const handleMeetingNotification = (payload) => {
      addNotification(payload);
    };

    socket.on("meetingNotification", handleMeetingNotification);
    return () => {
      socket.off("meetingNotification", handleMeetingNotification);
    };
  }, [socket]);

  // Function to remove a specific notification by its index
  const removeNotification = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((n) => n.id !== id)
    );
  };

  // Function to clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Function to show/hide the notification panel
  const toggleNotificationPanel = () => {
    setShowNotifications((prev) => !prev);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        clearNotifications,
        showNotifications,
        removeNotification,
        toggleNotificationPanel,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  return useContext(NotificationContext);
};