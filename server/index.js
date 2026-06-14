const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Store online users
let onlineUsers = {};

// Socket setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("addUser", (userId) => {
    onlineUsers[userId] = socket.id;
    console.log("Online users:", onlineUsers);

    io.emit("getOnlineUsers", onlineUsers);
  });

  socket.on("sendMessage", (data) => {
    console.log("Message received:", data);

    const receiverSocketId = onlineUsers[data.receiverId];

    if (!receiverSocketId) {
      console.log("Receiver not online:", data.receiverId);
      return;
    }

    io.to(receiverSocketId).emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    for (let userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
        break;
      }
    }

    io.emit("getOnlineUsers", onlineUsers);
  });
});

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend connected successfully" });
});

// Start server
const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});