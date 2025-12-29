import { FastifyInstance } from "fastify";
import { WebSocket } from "ws";

// Store all connected clients
const clients = new Set<WebSocket>();
const clientIds = new Map<WebSocket, string>();
let nextId = 0;

export default async function websocketHandler(fastify: FastifyInstance) {
  fastify.get(
    "/websocket",
    { websocket: true },
    (connection: WebSocket, request) => {
      console.log("Client connected. Total clients:", clients.size + 1);

      // Add client to the set
      clients.add(connection);

      // Send welcome message to this client
      connection.send("Welcome!");

      // Notify clients
      let id = `${nextId++}`;
      clientIds.set(connection, id);
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client !== connection) {
          client.send(`Client ${id} is online!`);
        }
      });

      // Handle incoming messages
      connection.on("message", (message: Buffer) => {
        const text = message.toString();
        console.log("Received:", text);

        // Broadcast to all connected clients
        clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(`${id}: ${text}`);
          }
        });
      });

      // Handle connection close
      connection.on("close", () => {
        clients.delete(connection);
        console.log("Client disconnected. Total clients:", clients.size);
        clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(`Client ${id} is now offline.`);
          }
        });
      });
    }
  );
}
