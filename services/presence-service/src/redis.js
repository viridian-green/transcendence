import Redis from "ioredis";

import { activeConnections } from "./handlers/presenceWebSocket.js";  // Your WS handler map

const redisSubscriber = new Redis({
  host: process.env.REDIS_HOST || "redis",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD || undefined,
});

redisSubscriber.subscribe("presence:updates");

redisSubscriber.on("message", (channel, message) => {
  if (channel === "presence:updates") {
    try {
      const data = JSON.parse(message);
      console.log(`[PRESENCE] Broadcasting: ${data.userId} -> ${data.state}`);
      
      const updateMsg = JSON.stringify({
        type: "userStateChanged",
        userId: data.userId,
        state: data.state
      });
      
      // Broadcast to ALL connected presence WS clients
      for (const [userId, conn] of activeConnections) {
        if (conn.readyState === WebSocket.OPEN) {
          conn.send(updateMsg);
        }
      }
    } catch (err) {
      console.error("[PRESENCE] Redis broadcast error:", err);
    }
  }
});

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "redis",
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6378,
  password: process.env.REDIS_PASSWORD || undefined,
});


const redisPublisher = new Redis(
  process.env.REDIS_URL || {
    host: process.env.REDIS_HOST || "redis",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD || undefined,
  }
);

export { redisPublisher, redisClient };