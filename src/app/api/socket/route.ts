import { NextResponse } from "next/server";
import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";

export async function GET(req: Request, res: any) {
  try {
    const httpServer: HttpServer = res.socket.server;

    if (!(httpServer as any).io) {
      const io = new SocketIOServer(httpServer, {
        path: "/api/socket",
        cors: {
          // origin: "*",
          origin: [
            "https://www.quiksbot.com/",
            "https://quiksbot.com/",
            "http://localhost:3000/",
          ],
          methods: ["GET", "POST"],
        },
        pingTimeout: 60000,
        pingInterval: 25000,
      });

      io.on("connection", (socket) => {
        // console.log("New client connected");

        socket.on("join-room", (roomId: string) => {
          socket.join(roomId);
          // console.log(`Joined room: ${roomId}`);
        });

        socket.on("message", (data) => {
          io.to(data.chatRoomId).emit("message", data);
          // console.log("Message sent to room:", data.chatRoomId);
        });

        socket.on("disconnect", () => {
          // console.log("Client disconnected");
        });

        // Handle reconnection
        socket.on("reconnect", (attemptNumber) => {
          // console.log(`Reconnected after ${attemptNumber} attempts`);
        });
      });

      (httpServer as any).io = io;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Socket.IO server error:", error);
    return NextResponse.json(
      { error: "Failed to initialize Socket.IO" },
      { status: 500 }
    );
  }
}
