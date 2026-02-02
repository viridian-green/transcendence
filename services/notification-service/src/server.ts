import Fastify from "fastify";
import websocket from "@fastify/websocket";
import NotificationsRoute from "./routes/notifications.js";
import "./redis/index.js"; // Initialize Redis subscriber
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3006;

// SSL configuration
const sslEnabled = process.env.SSL_ENABLED !== 'false'; // Default to true
let httpsOptions = null;

if (sslEnabled) {
    const certPath = path.join(__dirname, "../ssl/notification-service.crt");
    const keyPath = path.join(__dirname, "../ssl/notification-service.key");

    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
        httpsOptions = {
            cert: fs.readFileSync(certPath),
            key: fs.readFileSync(keyPath),
        };
        console.log('SSL enabled for Notification Service');
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

// Register Notifications WebSocket routes
await fastify.register(NotificationsRoute);

const start = async () => {
  try {
    const protocol = httpsOptions ? 'https' : 'http';
    await fastify.listen({
      port: PORT,
      host: "0.0.0.0"
    });
    console.log(`Notification Service running on ${protocol}://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

