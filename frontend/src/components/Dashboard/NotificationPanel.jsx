import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useNotifications } from "@/context/NotificationContext";
import { Trash2, Zap, Info, AlertCircle, X, Bell } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const NotificationPanel = () => {
  const {
    notifications,
    showNotifications,
    toggleNotificationPanel,
    removeNotification,
    clearNotifications,
  } = useNotifications();
  const navigate = useNavigate();

  const getIcon = (priority) => {
    switch (priority) {
      case "High":
        return <Zap className="text-white" size={16} />;
      case "Medium":
        return <AlertCircle className="text-white" size={16} />;
      default:
        return <Info className="text-white" size={16} />;
    }
  };

  const getColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-rose-500";
      case "Medium":
        return "bg-amber-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <>
      {/* Backdrop */}
      {showNotifications && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
          onClick={toggleNotificationPanel}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-card shadow-2xl z-50 transition-transform duration-300 ease-in-out transform ${
          showNotifications ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-card">
          <div>
            <h2 className="text-xl font-bold text-foreground">Notifications</h2>
            <p className="text-sm text-muted-foreground">
              You have {notifications.length} unread messages
            </p>
          </div>
          <button
            onClick={toggleNotificationPanel}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/50">
          <AnimatePresence mode="popLayout">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="bg-card p-4 rounded-xl border border-border shadow-sm relative group overflow-hidden"
                >
                  <div className="flex gap-4">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${getColor(
                        notification.details?.priority
                      )}`}
                    >
                      {getIcon(notification.details?.priority)}
                    </div>
                    <div className="flex-1 min-w-0">
                      {notification.type === "alert" ? (
                        <h1 className="text-sm font-semibold text-red-900 mb-1">{notification.title}</h1>
                      ) : notification.type === "missed_call" ? (
                        <h1 className="text-sm font-semibold text-red-500 mb-1">{notification.title}</h1>
                      ) : notification.type === "history" ? (
                        <h1 className="text-sm font-semibold text-green-900 mb-1">{notification.title}</h1>
                      ) : notification.type === "task_created" ? (
                        <h1 className="text-sm font-semibold text-blue-600 mb-1">{notification.title}</h1>
                      ) : (
                        <h1 className="text-sm font-semibold text-foreground mb-1">{notification.title}</h1>
                      )}
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-semibold text-foreground mb-1">
                          {notification.message}
                        </h4>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                          {notification.time}
                        </span>
                      </div>

                      {notification.details && (
                        <div className="text-xs text-muted-foreground bg-muted p-2 rounded-lg mt-2 border border-border">
                          <p>
                            <span className="font-medium text-foreground">
                              Title:
                            </span>{" "}
                            {notification.details.title}
                          </p>
                          {notification.details.department && (
                            <p className="mt-0.5">
                              <span className="font-medium text-foreground">
                                Type:
                              </span>{" "}
                              {notification.details.department}
                            </p>
                          )}
                          {(notification.details.joinUrl || notification.details.meetingId) && (
                            <button
                              type="button"
                              onClick={() => {
                                if (notification.details.joinUrl) {
                                  window.open(notification.details.joinUrl, "_blank", "noopener,noreferrer");
                                  return;
                                }
                                navigate(`/meeting/${notification.details.meetingId}`);
                              }}
                              className="mt-2 inline-flex items-center rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                            >
                              Join Meeting
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hover Delete Action */}
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="absolute top-2 right-2 p-1.5 bg-card text-muted-foreground hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-border"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground mt-20">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Bell size={24} className="text-muted-foreground/50" />
                </div>
                <p>No notifications yet.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-border bg-card">
            <Button
              variant="outline"
              className="w-full border-border hover:bg-accent text-muted-foreground"
              onClick={() => clearNotifications()}
            >
              Clear All Notifications
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationPanel;
