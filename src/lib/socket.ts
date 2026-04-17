import { io, Socket } from "socket.io-client";
import { BASE_URL } from "../../constant/url";

// Only initialize socket on the client side — `io()` at module level runs
// during Next.js SSR (server-side rendering), causing WebSocket errors on the
// server where there is no socket.io listener.
const createSocket = (): Socket => {
  const s = io(BASE_URL, {
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    randomizationFactor: 0.5,
    timeout: 20000,
    autoConnect: true,
    forceNew: true,
    transports: ["websocket", "polling"],
  });

  s.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });

  s.on("disconnect", (reason) => {
    if (reason === "io server disconnect") {
      s.connect();
    }
  });

  return s;
};

// Lazy singleton — created once on the client, never on the server
let _socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (typeof window === "undefined") {
    // Return a no-op stub during SSR so imports don't crash
    return {
      on: () => {},
      off: () => {},
      emit: () => {},
      connect: () => {},
    } as unknown as Socket;
  }
  if (!_socket) {
    _socket = createSocket();
  }
  return _socket;
};

// Keep backward-compatible named export for existing imports
export const socket = typeof window !== "undefined"
  ? (() => {
      if (!_socket) _socket = createSocket();
      return _socket;
    })()
  : ({ on: () => {}, off: () => {}, emit: () => {}, connect: () => {} } as unknown as Socket);
