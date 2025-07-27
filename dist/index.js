"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env["PORT"] || "8080", 10);
app.get("/", (_req, res) => {
    res.send("Server is ready for ADDA !");
});
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: [process.env["ORIGIN_PROD"], process.env["ORIGIN_DEV"]].filter((origin) => typeof origin === "string"),
        credentials: true,
    },
});
io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    socket.on("setup", (userData) => {
        if (!userData?._id) {
            console.error("Invalid user data received in setup");
            return;
        }
        socket.join(userData._id);
        socket.emit("Socket Connected");
        console.log(`User ${userData._id} connected`);
    });
    socket.on("join chat", (room) => {
        if (!room) {
            console.error("Invalid room data received");
            return;
        }
        socket.join(room);
        console.log(`Socket ${socket.id} joined room: ${room}`);
    });
    socket.on("new message", (newMessageReceived) => {
        if (!newMessageReceived?.chat?.users) {
            console.error("Invalid message data received");
            return;
        }
        const chat = newMessageReceived.chat;
        chat.users.forEach((user) => {
            if (user._id === newMessageReceived.sender._id)
                return;
            socket.in(user._id).emit("message received", newMessageReceived);
        });
    });
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
    socket.on("setup", (userData) => {
        socket.leave(userData._id);
        console.log("Socket disconnected and left room:", userData._id);
    });
});
server.listen(PORT, () => {
    if (!process.env["PORT"]) {
        console.log("PORT is not defined. Using default PORT 8080");
    }
    else {
        console.log(`Server running on PORT ${PORT}...`);
    }
});
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
//# sourceMappingURL=index.js.map