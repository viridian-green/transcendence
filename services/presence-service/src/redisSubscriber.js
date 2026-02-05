import Redis from "ioredis";
import WebSocket from "ws";
import { activeConnections, broadcastPresenceUpdate } from "./handlers/presenceWebSocket.js";
import { redisClient } from "./redis.js";

const redisSubscriber = new Redis({
  host: process.env.REDIS_HOST || "redis",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD || undefined,
});

redisSubscriber.subscribe("presence:updates");

redisSubscriber.on("message", async (channel, message) => {
  if (channel === "presence:updates") {
    try {
      const data = JSON.parse(message);

      // Persist the state to Redis (so REST API returns correct data)
      await redisClient.set(`user:state:${data.userId}`, data.state);

      const updateMsg = JSON.stringify({
        type: "userStateChanged",
        userId: data.userId,
        state: data.state
      });

      // Broadcast to ALL connected presence WS clients
      for (const [_userId, conn] of activeConnections) {
        if (conn.readyState === WebSocket.OPEN) {
          conn.send(updateMsg);
        }
      }

      // Also broadcast onlineUsersUpdated so useFetchOnlineUsers refetches
      broadcastPresenceUpdate();
    } catch (err) {
      console.error("[PRESENCE] Redis broadcast error:", err);
    }
  }
});

export { redisSubscriber };
