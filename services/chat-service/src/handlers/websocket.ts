import { FastifyInstance } from "fastify";
import type { WebSocket } from "ws";

// Store all connected clients
const clients = new Set<WebSocket>();

export default async function websocketHandler(fastify: FastifyInstance) {
  fastify.get(
    "/websocket",
    { websocket: true },
    (connection: WebSocket, request) => {
      console.log("Client connected. Total clients:", clients.size + 1);

      // Add client to the set
      clients.add(connection);

      // Send welcome message to this client
      connection.send("Connected to chat server!");

      // Handle incoming messages
      connection.on("message", (message: Buffer) => {
        const text = message.toString();
        console.log("Received:", text);

        // Broadcast to all connected clients
        clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(`${text}`);
          }
        });
      });

      // Handle connection close
      connection.on("close", () => {
        clients.delete(connection);
        console.log("Client disconnected. Total clients:", clients.size);
      });
    }
  );
}
