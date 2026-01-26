import { handlePresenceConnection } from "../handlers/presenceWebSocket.js";
import { extractUserFromJWT } from "../utils/extractUserFromJWT.js";

export default async function presenceRoutes(fastify) {
  // WebSocket endpoint for presence tracking
  fastify.get("/presence", { websocket: true }, (connection, request) => {
    const user = extractUserFromJWT(request);

    if (!user) {
      connection.send(
        JSON.stringify({ error: "Authentication required" })
      );
      connection.close();
      return;
    }

    handlePresenceConnection(connection, request, user);
  });
}
