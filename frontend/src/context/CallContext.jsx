import { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "./SocketContext";
import { toast } from "sonner";
import IncomingCall from "@/components/Chat/IncomingCall";
import VideoCall from "@/components/Chat/VideoCall";
import { useAuth } from "./AuthContext";
import { useNotifications } from "./NotificationContext";

const CallContext = createContext();

export const useCall = () => useContext(CallContext);

export const CallProvider = ({ children }) => {
  const { user } = useAuth();
  const socket = useSocket();
  const { addNotification } = useNotifications();

  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = (data) => {
      console.log("Receiving Call Signal:", data);
      toast.success(`Incoming Call from ${data.caller?.firstName}`);

      if (isCallActive) {
        socket.emit("busyCall", { to: data.caller._id });
        return;
      }
      setIncomingCall({
        caller: data.caller,
        roomId: data.roomId,
        type: data.type,
      });
    };

    const handleCallRejected = () => {
      toast.info("Call declined.");

      addNotification({
        title: "Call Declined",
        message: "The user is busy or declined your call.",
        type: "alert",
        timestamp: new Date().toISOString(),
      });
      setActiveCall(null);
      setIsCallActive(false);
    };

    const handleCallCancelled = () => {
      setIncomingCall((prev) => {
        if (prev) {
          addNotification({
            title: "Missed Call",
            message: `You missed a call from ${prev.caller.username}`,
            type: "missed_call",
            timestamp: new Date().toISOString(),
            meta: { userId: prev.caller._id },
          });
          toast.info("Call cancelled.");
        }
        return null;
      });
    };

    const handleCallEnded = () => {
      addNotification({
        title: "Call Ended",
        message: "Voice/Video call finished.",
        type: "history",
        timestamp: new Date().toISOString(),
      });

      setActiveCall(null);
      setIsCallActive(false);
      setIncomingCall(null);
    };

    socket.on("incomingCall", handleIncomingCall);
    socket.on("callRejected", handleCallRejected);
    socket.on("callCancelled", handleCallCancelled);
    socket.on("callEnded", handleCallEnded);

    return () => {
      socket.off("incomingCall", handleIncomingCall);
      socket.off("callRejected", handleCallRejected);
      socket.off("callCancelled", handleCallCancelled);
      socket.off("callEnded", handleCallEnded);
    };
  }, [socket, isCallActive, addNotification]);

  const initiateCall = (recipient, type) => {
    if (!socket) {
      toast.error("Connection lost. Cannot start call.");
      return;
    }
    if (!user || !user._id) {
      toast.error("User profile not loaded. Please refresh.");
      return;
    }

    const roomId = `${user._id}-${recipient._id}-${Date.now()}`;

    setActiveCall({ roomId, type, recipientId: recipient._id, remoteUser: recipient });
    setIsCallActive(true);

    const callerData = {
      _id: user._id,
      firstName: user.firstName || "Unknown User",
      lastName: user.lastName || "Unknown User",
      profileImage: user.profileImage || null,
      jobTitle: user.jobTitle,
    };

    socket.emit("startCall", {
      to: recipient._id,
      caller: callerData,
      roomId,
      type,
    });
  };

  const acceptCall = () => {
    if (!incomingCall) return;
    setActiveCall({
      roomId: incomingCall.roomId,
      type: incomingCall.type,
      otherUser: incomingCall.caller,
    });
    setIsCallActive(true);
    setIncomingCall(null);
  };

  const declineCall = () => {
    if (socket && incomingCall) {
      socket.emit("rejectCall", { to: incomingCall.caller._id });
    }
    setIncomingCall(null);
  };

  const endCall = () => {
    setActiveCall((prev) => {
      if (prev?.recipientId && socket) {
        socket.emit("endCall", { to: prev.recipientId });
      }
      return null;
    });

    addNotification({
      title: "Call Summary",
      message: "You ended the call.",
      type: "history",
      timestamp: new Date().toISOString(),
    });

    setIsCallActive(false);
    setIncomingCall(null);
  };

  return (
    <CallContext.Provider value={{ initiateCall, isCallActive }}>
      {children}
      {incomingCall && (
        <IncomingCall
          caller={incomingCall.caller}
          type={incomingCall.type}
          onAccept={acceptCall}
          onDecline={declineCall}
        />
      )}

      {activeCall && (
        <VideoCall
          key={activeCall.roomId}
          user={user}
          isVideo={activeCall.type === "video"}
          onLeave={endCall}
          socket={socket}
          isInitiator={!!activeCall.recipientId}
          recipientId={activeCall.recipientId || activeCall.otherUser?._id}
          remoteUser={activeCall.remoteUser || activeCall.otherUser}
        />
      )}
    </CallContext.Provider>
  );
};
