import "dotenv/config";
import express from "express";
import { Server } from "socket.io";
import { createServer } from "node:http";
import connectDB from "./db";
import authRouter from "./auth/auth-router";
import UserModel from "./auth/models/User";
import AuthService from "./auth/auth-service";
import cors from 'cors';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 10000;
server.keepAliveTimeout = 120000; 
server.headersTimeout = 120000;   

connectDB();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);

const authService = new AuthService();

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  const payload = authService.verifyJwt(token);
  if (!payload) {
    return next(new Error("Authentication error"));
  }
  socket.data.user = payload;
  next();
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  const userId = socket.data.user.id;
  markUserOnline(userId);

  socket.on("join-room", (room) => {
    console.log(`User ${userId} joined room: ${room}`);
    socket.join(room);
  });

  socket.on("send-message", async (message, room) => {
    const user = await UserModel.findById(userId);
    if (user) {
      const messageData = {
        message,
        username: user.username || user.email,
      };
      io.to(room).emit("receive-message", messageData);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    markUserOffline(userId);
  });
});

server.listen(PORT,  () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

async function markUserOnline(userId: string) {
  try {
    await UserModel.findByIdAndUpdate(userId, { online: true });
    console.log(`User ${userId} marked as online`);
  } catch (error) {
    console.error('Error marking user online:', error);
  }
}

async function markUserOffline(userId: string) {
  try {
    await UserModel.findByIdAndUpdate(userId, { online: false });
    console.log(`User ${userId} marked as offline`);
  } catch (error) {
    console.error('Error marking user offline:', error);
  }
}
