import Fastify from "fastify";
import websocket from "@fastify/websocket";
import ChatsocketsRoute from "./routes/chatsockets.js";
// import OnlineUsersRoute from "./routes/onlineUsers.js";
import { Server as SocketIOServer } from "socket.io";
import {
  setupSubscribers,
  subscribeGeneralChat,
} from "./redis/subscribers.js";

const fastify = Fastify({
  logger: true,
});

// Register WebSocket @fastify/websocket plugin
await fastify.register(websocket);

// Register ChatSockets WebSockets routes
await fastify.register(ChatsocketsRoute);
// await fastify.register(OnlineUsersRoute);

const PORT = process.env.CHAT_PORT ? parseInt(process.env.CHAT_PORT, 10) : 3004;

// Attach socket.io to Fastify's internal HTTP server
const io = new SocketIOServer(fastify.server, {
  cors: { origin: "*" }, // adjust as needed
});

subscribeGeneralChat();
setupSubscribers(io);

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
