import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";

let io: SocketServer;

export function initSocket(server: HttpServer) {
  io = new SocketServer(server, {
    path: "/api/socket.io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`[socket] User connected: ${socket.id}`);

    socket.on("join", (userId: string) => {
      socket.join(userId);
      console.log(`[socket] User ${userId} joined room`);
    });

    socket.on("disconnect", () => {
      console.log(`[socket] User disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

export function emitToUser(userId: string, event: string, data: any) {
  if (io) {
    io.to(userId).emit(event, data);
  }
}
