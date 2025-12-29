import Fastify from "fastify";
import websocket from "@fastify/websocket";
import websocketHandler from "./handlers/websocket.js";

const fastify = Fastify({
  logger: true,
});

// Register WebSocket plugin
await fastify.register(websocket);

// Register WebSocket handler
await fastify.register(websocketHandler);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3004;

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
