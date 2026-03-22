import jwt from "jsonwebtoken";
import Message from "../models/MessageModel.js";
import Channel from "../models/channelModel.js";

const initializeSocket = (io) => {
  // 🔑 This is our powerful authentication middleware
  io.use((socket, next) => {
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
      console.error("Socket Auth Error: No cookie header provided.");
      return next(new Error("Authentication Error: Cookie not provided."));
    }

    const token = cookieHeader
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      console.error("Socket Auth Error: 'token' cookie missing from header.");
      return next(new Error("Authentication Error: Token not provided."));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // 🚨 ADD THIS LINE TO SEE THE JWT ERROR REASON (e.g., 'TokenExpiredError')
        console.error("JWT Verification Error:", err.name, err.message);
        return next(new Error("Authentication Error: Invalid token."));
      }

      if (!decoded.id || !decoded.organizationId)
        return next(
          new Error("Authentication Error: Token is missing required data.")
        ); // Attach user info to the socket object for later use

      socket.user = {
        id: decoded.id,
        role: decoded.role,
        organizationId: decoded.organizationId,
      };

      next(); // Grant connection
    });
  });

  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.user.id}`);
    socket.join(socket.user.organizationId);

    socket.join(socket.user.id);

    socket.on("joinChat", async (channelId) => {
      try {
        const channel = await Channel.findOne({
          _id: channelId,
          participants: { $elemMatch: { $eq: socket.user.id } },
          organizationId: socket.user.organizationId,
        });

        if (!channel) {
          console.warn(
            `SECURITY: User ${socket.user.id} denied from joining channel ${channelId}`
          );
          return;
        }

        socket.join(channelId);
        console.log(`User ${socket.user.id} joined channel: ${channelId}`);
      } catch (error) {
        console.error(`Error joining channel ${channelId}:`, error.message);
      }
    });

    socket.on("sendMessage", async (data) => {
      const { channelId, content } = data;

      if (!channelId || !content) {
        console.error("Validation Error: channelId or content is missing.");
        return;
      }

      try {
        const channel = await Channel.findOne({
          _id: channelId,
          participants: { $elemMatch: { $eq: socket.user.id } },
        });

        if (!channel) {
          console.warn(
            `SECURITY: User ${socket.user.id} tried to send to un-joined channel ${channelId}`
          );
          return;
        }

        // User is authorized, now create the message
        const newMessageData = {
          sender: socket.user.id,
          content: content,
          channel: channelId,
          organizationId: socket.user.organizationId,
        };

        let message = await Message.create(newMessageData);

        message = await message.populate(
          "sender",
          "firstName MiddleName lastName email contactNo"
        );

        // Step C: Broadcast the new message to everyone in the channel's room
        io.to(channelId).emit("newMessage", message);
        console.log("✅ Message sent successfully to channel:", channelId);
      } catch (error) {
        console.error("❌ Error sending message:", error);
      }
    });

    socket.on("startCall", ({ to, caller, roomId, type }) => {
      console.log(`📞 Call signaling: ${caller.username} calling ${to}`);
      io.to(to).emit("incomingCall", {
        caller,
        roomId,
        type,
      });
    });

    socket.on("cancelCall", ({ to }) => {
      console.log(`Call cancelled by caller for: ${to}`);
      io.to(to).emit("callCancelled"); 
    });

    socket.on("rejectCall", ({ to }) => {
      // 'to' here is the ID of the person who CALLED you
      io.to(to).emit("callRejected");
    });

    socket.on("endCall", ({ to }) => {
       io.to(to).emit("callEnded");
    });

    // WebRTC Signaling Events
    socket.on("webrtc_ready", ({ to }) => {
      io.to(to).emit("webrtc_ready");
    });

    socket.on("callUser", ({ userToCall, signalData, from }) => {
      io.to(userToCall).emit("callUser", { signal: signalData, from });
    });

    socket.on("answerCall", ({ to, signal }) => {
      io.to(to).emit("callAccepted", signal);
    });

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.user.id}`); // You can emit a status update here if you want
    });
  });
};

export default initializeSocket;
