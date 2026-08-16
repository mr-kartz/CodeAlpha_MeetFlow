import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.DEV
    ? "http://192.168.29.52:5000"
    : window.location.origin;

const socket = io(SOCKET_URL, {
  transports: ["polling", "websocket"],

  autoConnect: false,

  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,

  timeout: 20000,
});

socket.on("connect", () => {
  console.log("🟢 Socket Connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("🔴 Socket Disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket Error:", err.message);
});

export default socket;