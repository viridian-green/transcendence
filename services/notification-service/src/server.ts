import Fastify from "fastify";
import websocket from "@fastify/websocket";
import NotificationsRoute from "./routes/notifications.js";
import { setupNotificationSubscriber } from "./redis/subscriber.js";

const fastify = Fastify({
  logger: true,
});

// Register WebSocket @fastify/websocket plugin
await fastify.register(websocket);

// Register Notifications WebSocket routes
await fastify.register(NotificationsRoute);
await setupNotificationSubscriber();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3006;

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

