import { io } from "socket.io-client";

// Connect to your backend socket
const socket = io("http://localhost:3000"); // change if different port

socket.on("connect", () => {
  console.log("✅ Connected to server:", socket.id);

  // Join room as user_1 for example
  socket.emit("join_room", { id: 1, type: "user" });

  // Listen for incoming messages
  socket.on("new_message", (msg) => {
    console.log("📩 New message received:", msg);
  });
});
