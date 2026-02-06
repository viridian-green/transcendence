import Fastify from "fastify";
import websocket from "@fastify/websocket";
import ChatsocketsRoute from "./routes/chatsockets.js";
import {
  setupSubscribers,
  subscribeGeneralChat,
} from "./redis/subscribers.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.CHAT_PORT) {
  console.error('ERROR: CHAT_PORT environment variable is required');
  process.exit(1);
}
const PORT = parseInt(process.env.CHAT_PORT, 10);

// SSL configuration - HTTPS is mandatory
const certPath = path.join(__dirname, "../ssl/chat-service.crt");
const keyPath = path.join(__dirname, "../ssl/chat-service.key");

if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    console.error('ERROR: SSL certificates are required but not found!');
    console.error(`Certificate path: ${certPath}`);
    console.error(`Key path: ${keyPath}`);
    console.error('Please generate SSL certificates using: ./scripts/generate-ssl-certs.sh');
    process.exit(1);
}

const httpsOptions = {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath),
};

const fastify = Fastify({
  logger: true,
  https: httpsOptions
});

// Register WebSocket @fastify/websocket plugin
await fastify.register(websocket);

// Register ChatSockets WebSockets routes
await fastify.register(ChatsocketsRoute);

subscribeGeneralChat();
setupSubscribers();

const start = async () => {
  try {
    await fastify.listen({
      port: PORT,
      host: "0.0.0.0"
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
