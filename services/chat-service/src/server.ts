import Fastify from "fastify";
import websocket from "@fastify/websocket";
import ChatsocketsRoute from "./routes/chatsockets.js";

const fastify = Fastify({
  logger: true,
});

// Register WebSocket @fastify/websocket plugin
await fastify.register(websocket);

// Register ChatSockets WebSocket route
await fastify.register(ChatsocketsRoute);

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
