import Fastify from "fastify";
import dotenv from "dotenv";
import websocket from "@fastify/websocket";
import stateRoutes from "./routes/state.routes.js";
import presenceRoutes from "./routes/presence.routes.js";

dotenv.config();

const app = Fastify({
  logger: true,
});

// Register WebSocket plugin
await app.register(websocket);

// Register routes
await app.register(presenceRoutes);
await app.register(stateRoutes, { prefix: "/" });
await app.ready();
console.log(app.printRoutes());

export default app;


