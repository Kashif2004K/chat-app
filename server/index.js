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
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Add user to online list
  socket.on("addUser", (userId) => {
    onlineUsers[userId] = socket.id;

    console.log("Online users:", onlineUsers);

    // Optional: send updated online users to all clients
    io.emit("getOnlineUsers", onlineUsers);
  });

  // Handle sending message
  socket.on("sendMessage", (data) => {
    console.log("Message received:", data);

    const receiverSocketId = onlineUsers[data.receiverId];

    if (!receiverSocketId) {
      console.log("Receiver not online:", data.receiverId);
      return;
    }

    // Send message to receiver only
    io.to(receiverSocketId).emit("receiveMessage", data);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // remove user from online list
    for (let userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
        break;
      }
    }

    console.log("Updated online users:", onlineUsers);
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