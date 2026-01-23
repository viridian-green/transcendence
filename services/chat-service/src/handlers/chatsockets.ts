import { WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { updateUserState } from "../utils/userStateApi.js";
import {
  subscribeUserChannel,
  unsubscribeUserChannel,
  wsByUserId,
} from "../redis/subscribers.ts";
import Redis from "ioredis";

export interface User {
  id: string;
  username: string;
  state?: string; // Allowed: "online", "offline", "busy"
}

// Map to keep track of connected clients and their user info
const clients: Map<WebSocket, User> = new Map();
const redisPublisher = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379" // Replace with your Redis URL in envm check if localhost is correct
);

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
  handleConnection(connection, user); // Handle new connection

  // Handle incoming messages
  connection.on("message", (message: string | Buffer) =>
    handleMessage(connection, user, message)
  );

  // Handle disconnection
  connection.on("close", () => {
    unsubscribeUserChannel(user.id);
    wsByUserId.delete(user.id);
    handleDisconnect(connection, user);
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

function handleConnection(connection: WebSocket, user: User) {
  clients.set(connection, user);
  user.state = "online";
  updateUserState(user.id, user.state);
  console.log(
    `User ${user.username} connected. Total clients: ${clients.size}`
  );
  connection.send(
    JSON.stringify({
      type: "welcome",
      message: `Welcome, ${user.username}!`,
      user: { id: user.id, username: user.username, state: user.state },
    })
  );
  // Broadcast to all other clients that this user joined and is online
  broadcastToOthers(connection, {
    type: "user_joined",
    user: { id: user.id, username: user.username, state: user.state },
  });
}

function handleMessage(
  connection: WebSocket,
  user: User,
  message: string | Buffer
) {
  let payload: any;
  try {
    payload =
      typeof message === "string"
        ? JSON.parse(message)
        : JSON.parse(message.toString());
  } catch {
    connection.send(JSON.stringify({ error: "Invalid message format" }));
    return;
  }

  if (payload.type === "private_msg" && payload.to && payload.text) {
    // Private message: publish to recipient's channel
    const msg = JSON.stringify({
      type: "private_msg",
      from: { id: user.id, username: user.username },
      text: payload.text,
      timestamp: Date.now(),
    });
    redisPublisher.publish(`user:${payload.to}`, msg);
  } else if (payload.type === "general_msg" && payload.text) {
    // General chat: publish to _msg channel
    const msg = JSON.stringify({
      type: "general_msg",
      user: { id: user.id, username: user.username },
      text: payload.text,
      timestamp: Date.now(),
    });
    redisPublisher.publish("chat:general", msg);
  } else {
    connection.send(JSON.stringify({ error: "Invalid message payload" }));
  }
}

function handleDisconnect(connection: WebSocket, user: User) {
  clients.delete(connection);
  user.state = "offline";
  updateUserState(user.id, user.state);
  console.log(
    `User ${user.username} disconnected. Total clients: ${clients.size}`
  );
  // Notify others that user left and is now offline
  broadcastAll({
    type: "user_left",
    user: { id: user.id, username: user.username, state: user.state },
  });
  // Optionally broadcast state change
  broadcastAll({
    type: "user_state",
    user: { id: user.id, username: user.username, state: user.state },
  });
}

// Helper to broadcast to all clients
function broadcastAll(payload: any) {
  for (const [client] of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  }
}

// Helper to broadcast to all except one
function broadcastToOthers(except: WebSocket, payload: any) {
  for (const [client] of clients) {
    if (client !== except && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  }
}

export default chatsocketsHandler;
