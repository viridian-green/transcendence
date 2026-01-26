import { Server as SocketIOServer, Socket } from "socket.io";

// Helper to find a socket by userId (implement according to your auth/session logic)
function findSocketByUserId(
  io: SocketIOServer,
  userId: string
): Socket | undefined {
  for (const [id, socket] of io.of("/").sockets) {
    if (socket.data.userId === userId) return socket;
  }
  return undefined;
}

export default findSocketByUserId;