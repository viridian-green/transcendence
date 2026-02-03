import Fastify from "fastify";
import websocket from "@fastify/websocket";
import NotificationsRoute from "./routes/notifications.js";
import { setupNotificationSubscriber } from "./redis/subscriber.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3006;

// SSL configuration - HTTPS is mandatory
const certPath = path.join(__dirname, "../ssl/notification-service.crt");
const keyPath = path.join(__dirname, "../ssl/notification-service.key");

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

console.log('SSL enabled for Notification Service - HTTPS is mandatory');

const fastify = Fastify({
  logger: true,
  https: httpsOptions
});

// Register WebSocket @fastify/websocket plugin
await fastify.register(websocket);

// Register Notifications WebSocket routes
await fastify.register(NotificationsRoute);
await setupNotificationSubscriber();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3006;

const start = async () => {
  try {
    await fastify.listen({
      port: PORT,
      host: "0.0.0.0"
    });
    console.log(`Notification Service running on https://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

