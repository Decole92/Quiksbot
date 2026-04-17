import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer, {
      cors: {
        origin: ["https://www.quiksbot.com/", "https://quiksbot.com"],

        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("join-room", (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room: ${roomId}`);
      });

      socket.on("message", (data) => {
        console.log("Received message:", data);
        io.to(data.chatRoomId).emit("message", data);
      });

      socket.on("leave-room", (roomId) => {
        socket.leave(roomId);
        console.log(`Socket ${socket.id} left room: ${roomId}`);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });

    // Error handling
    httpServer.on("error", (error) => {
      console.error("HTTP Server Error:", error);
    });

    // Start the server
    httpServer.listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
  })
  .catch((error) => {
    console.error("Server startup error:", error);
    process.exit(1);
  });
