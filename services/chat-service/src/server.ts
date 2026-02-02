import Fastify from "fastify";
import websocket from "@fastify/websocket";
import ChatsocketsRoute from "./routes/chatsockets.js";
import { Server as SocketIOServer } from "socket.io";
import {
  setupSubscribers,
  subscribeGeneralChat,
} from "./redis/subscribers.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.CHAT_PORT ? parseInt(process.env.CHAT_PORT, 10) : 3004;

// SSL configuration
const sslEnabled = process.env.SSL_ENABLED !== 'false'; // Default to true
let httpsOptions = null;

if (sslEnabled) {
    const certPath = path.join(__dirname, "../ssl/chat-service.crt");
    const keyPath = path.join(__dirname, "../ssl/chat-service.key");

    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
        httpsOptions = {
            cert: fs.readFileSync(certPath),
            key: fs.readFileSync(keyPath),
        };
        console.log('SSL enabled for Chat Service');
    } else {
        console.warn('SSL certificates not found, falling back to HTTP');
    }
}

const fastify = Fastify({
  logger: true,
  ...(httpsOptions ? { https: httpsOptions } : {})
});

// Register WebSocket @fastify/websocket plugin
await fastify.register(websocket);

// Register ChatSockets WebSockets routes
await fastify.register(ChatsocketsRoute);
// await fastify.register(OnlineUsersRoute);

// Attach socket.io to Fastify's internal HTTP server
const io = new SocketIOServer(fastify.server, {
  cors: { origin: "*" }, // adjust as needed
});

subscribeGeneralChat();
setupSubscribers(io);

const start = async () => {
  try {
    const protocol = httpsOptions ? 'https' : 'http';
    await fastify.listen({
      port: PORT,
      host: "0.0.0.0"
    });
    console.log(`Chat Service running on ${protocol}://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
