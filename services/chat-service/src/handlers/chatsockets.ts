import { WebSocket } from "ws";
import {
  subscribeUserChannel,
  unsubscribeUserChannel,
  wsByUserId,
} from "../redis/subscribers.js";
import Redis from "ioredis";
import { handleConnection } from "./handleConnection.js";
import { handleMessage } from "./handleMessage.js";
import { handleDisconnect } from "./handleDisconnect.js";
import extractUserFromJWT from "../utils/extractUserFromJWT.js";
import { User } from "../types.js";

// Map to keep track of connected clients and their user info
const clients: Map<WebSocket, User> = new Map();

if (!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
  console.error('ERROR: REDIS_HOST and REDIS_PORT environment variables are required');
  process.exit(1);
}

// Redis publisher for sending messages
const redisPublisher = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT, 10),
});

// Main WebSocket handler function (not exported directly)
function chatsocketsHandler(connection: WebSocket, request: any) {
  const user = extractUserFromJWT(request);
  if (!user) {
    connection.send(JSON.stringify({ type: "error", error: "Authentication required" }));
    connection.close();
    return;
  }

  // On new connection
  subscribeUserChannel(user.id); // Subscribe to user's private Redis channel
  wsByUserId.set(user.id, connection); // Store WebSocket by userId
  handleConnection(connection, user, clients); // Handle new connection

  // Handle incoming messages
  connection.on("message", (message: string | Buffer) =>
    handleMessage(connection, user, message, redisPublisher),
  );

  // Handle disconnection
  connection.on("close", () => {
    unsubscribeUserChannel(user.id);
    wsByUserId.delete(user.id);
    handleDisconnect(connection, user, clients);
  });

  // Handle errors
  connection.on("error", (error: Error) => {
    console.error(`WebSocket error for user ${user.username}:`, error);
  });
}

export default chatsocketsHandler;
