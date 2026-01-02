import { FastifyInstance } from "fastify";
import { WebSocket } from "ws";
import jwt from "jsonwebtoken";

// Store all connected clients with their usernames
const clients = new Map<WebSocket, string>();

export default async function websocketHandler(fastify: FastifyInstance) {
  fastify.get(
    "/websocket",
    { websocket: true },
    (connection: WebSocket, request) => {
      let username: string | undefined;
      let userId: string | undefined;

      try {
        // Debug: Log all headers
        console.log("WebSocket connection headers:", request.headers);

        // Extract user info from headers (set by API gateway after JWT verification)
        username = request.headers["x-username"] as string;
        userId = request.headers["x-user-id"] as string;

        // Fallback: decode JWT from Cookie header if proxy headers are missing
        if ((!username || !userId) && request.headers.cookie) {
          const match = request.headers.cookie.match(/access_token=([^;]+)/);
          const token = match ? match[1] : null;
          if (token && process.env.JWT_SECRET) {
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
            username = decoded.username;
            userId = decoded.id?.toString();
          }
        }

        console.log("Extracted username:", username, "userId:", userId);

        if (!username || !userId) {
          console.log("Authentication failed: missing headers");
          connection.send(JSON.stringify({ error: "Authentication required" }));
          connection.close();
          return;
        }

        console.log(
          `User ${username} connected. Total clients:`,
          clients.size + 1
        );

        // Add client to the map with their username
        clients.set(connection, username);

        // Send welcome message
        connection.send(
          JSON.stringify({
            type: "welcome",
            message: `Welcome, ${username}!`,
          })
        );

        // Broadcast to all other clients that this user joined
        clients.forEach((clientUsername, client) => {
          if (client !== connection && client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "user_joined",
                username: username,
              })
            );
          }
        });
      } catch (error) {
        console.error("Authentication error:", error);
        connection.send(
          JSON.stringify({ error: "Invalid authentication token" })
        );
        connection.close();
        return;
      }

      // Handle incoming messages
      connection.on("message", (message: Buffer) => {
        const text = message.toString();
        console.log(`Received from ${username}:`, text);

        // Broadcast to all connected clients
        clients.forEach((clientUsername, client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "message",
                username: username,
                text: text,
              })
            );
          }
        });
      });

      // Handle connection close
      connection.on("close", () => {
        clients.delete(connection);
        console.log(
          `User ${username} disconnected. Total clients:`,
          clients.size
        );

        // Notify others that user left
        clients.forEach((clientUsername, client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "user_left",
                username: username,
              })
            );
          }
        });
      });
    }
  );
}
