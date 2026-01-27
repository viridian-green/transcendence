import { handlePresenceConnection } from "../handlers/presenceWebSocket.js";

export default async function presenceRoutes(fastify) {
    // WebSocket endpoint for presence tracking (must match gateway rewrite)
    fastify.get("/", { websocket: true }, (connection, request) => {
        handlePresenceConnection(connection, request);
  });
}
