import dotenv from "dotenv";
dotenv.config();
import express from "express";
import http from "http";
import { Server as SocketServer } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import connectDB from "./db/connectdb.js";

import authRoutes from "./routes/auth.route.js";
import employeeRoute from "./routes/employee.route.js";
import employeePageRoute from "./routes/employeePage.route.js";
import departmentRoute from "./routes/department.route.js";
import departmentDetailRoute from "./routes/department.page.route.js";
import teamRouter from "./routes/team.route.js";
import taskRouter from "./routes/task.route.js";
import commentRoute from "./routes/Comment.route.js";
import chatRoute from "./routes/chat.route.js";
import dashboard from "./routes/dashboard.route.js";
import roomRoute from './routes/room.route.js';
import meetingRoute from './routes/meeting.route.js';
import activityRoute from './routes/recentActivity.route.js';
import initializeSocket from "./sockets/socketManager.js";

connectDB();

const app = express();
app.set("trust proxy", false);
const server = http.createServer(app);

// Use the cors middleware for Express before the Socket.IO setup
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

// Socket.IO server setup
const io = new SocketServer(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

initializeSocket(io);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use("/api", limiter);

// Import routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboard);
app.use("/api/task", taskRouter);
app.use("/api/comment", commentRoute);
app.use("/api/department", departmentRoute);
app.use("/api/dept-details", departmentDetailRoute);
app.use("/api/employeePage", employeePageRoute);
app.use("/api/employee", employeeRoute);
app.use("/api/team", teamRouter);
app.use("/api/chat", chatRoute);
app.use('/api/room', roomRoute);
app.use('/api/meeting', meetingRoute);
app.use('/api/activities', activityRoute);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error: ", err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
