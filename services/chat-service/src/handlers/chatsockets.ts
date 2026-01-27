import { WebSocket } from "ws";
import jwt from "jsonwebtoken";
import {
  subscribeUserChannel,
  unsubscribeUserChannel,
  wsByUserId,
} from "../redis/subscribers.js";
import Redis from "ioredis";
import { handleConnection } from "./handleConnection.js";
import { handleMessage } from "./handleMessage.js";
import { handleDisconnect } from "./handleDisconnect.js";

export interface User {
  id: string;
  username: string;
  state?: string; // Allowed: "online", "offline", "busy"
}

// Map to keep track of connected clients and their user info
const clients: Map<WebSocket, User> = new Map();

// Redis publisher for sending messages
const redisPublisher = new Redis({
  host: process.env.REDIS_HOST || "redis",
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6378,
});

// Main WebSocket handler function (not exported directly)
function chatsocketsHandler(connection: WebSocket, request: any) {
  const user = extractUserFromJWT(request);
  if (!user) {
    connection.send(JSON.stringify({ error: "Authentication required" }));
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
}

// Helpers
function extractUserFromJWT(request: any): User | null {
  const cookieHeader = request.headers["cookie"] as string | undefined;
  let cookies: Record<string, string> = {};
  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      if (parts.length === 2) {
        cookies[parts[0].trim()] = decodeURIComponent(parts[1].trim());
      }
    });
  }
  const accessToken = cookies["access_token"];
  const jwtSecret = process.env.JWT_SECRET;
  if (accessToken && jwtSecret) {
    try {
      const decoded = jwt.verify(accessToken, jwtSecret) as any;
      if (decoded.username && decoded.id) {
        return { username: decoded.username, id: String(decoded.id) };
      }
    } catch (err) {
      console.error("Invalid JWT:", err);
      return null;
    }
  }
  return null;
}

export default chatsocketsHandler;
