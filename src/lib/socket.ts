import { io, Socket } from "socket.io-client";
import { BASE_URL } from "../../constant/url";

export const socket: Socket = io(BASE_URL, {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  randomizationFactor: 0.5,
  timeout: 20000,
  autoConnect: true,
  forceNew: true,
  transports: ["websocket", "polling"],
});

// Error handling
socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);

  // Attempt to reconnect
  if (reason === "io server disconnect") {
    socket.connect();
  }
});
