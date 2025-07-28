import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { UserData, ChatUser, MessageData } from "./interface";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT: number = parseInt(process.env["PORT"] || "8080", 10);

// Basic route
app.get("/", (_req: Request, res: Response): void => {
  res.send("Server is ready for ADDA !");
});

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: [process.env["ORIGIN_PROD"], process.env["ORIGIN_DEV"]].filter(
      (origin): origin is string => typeof origin === "string"
    ),
    credentials: true,
  },
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Handle user setup
  socket.on("setup", (userData: UserData) => {
    if (!userData?._id) {
      console.error("Invalid user data received in setup");
      return;
    }

    socket.join(userData._id);
    socket.emit("Socket Connected");
    console.log(`User ${userData._id} connected`);
  });

  // Handle joining chat rooms
  socket.on("join chat", (room: string) => {
    if (!room) {
      console.error("Invalid room data received");
      return;
    }

    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  // Handle new messages
  socket.on("new message", (newMessageReceived: MessageData) => {
    if (!newMessageReceived?.chat?.users) {
      console.error("Invalid message data received");
      return;
    }

    const chat = newMessageReceived.chat;
    
    chat.users.forEach((user: ChatUser) => {
      // Don't send message back to sender
      if (user._id === newMessageReceived.sender._id) return;
      
      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });

  // Handle setup cleanup
  // socket.on("setup", (userData: UserData) => {
  //   socket.leave(userData._id);
  //   console.log("Socket disconnected and left room:", userData._id);
  // });
});

// Start server
server.listen(PORT, () => {
  if (!process.env["PORT"]) {
    console.log("PORT is not defined. Using default PORT 8080");
  } else {
    console.log(`Server running on PORT ${PORT}...`);
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

// Handle typing indicators
// socket.on("typing", (room: string) => {
//   if (!room) return;
//   socket.in(room).emit("typing");
// });

// socket.on("stop typing", (room: string) => {
//   if (!room) return;
//   socket.in(room).emit("stop typing");
// });
