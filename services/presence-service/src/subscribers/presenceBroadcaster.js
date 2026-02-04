import Redis from "ioredis";
import WebSocket from "ws";
import { activeConnections } from "../handlers/presenceWebSocket.js";

let redisSubscriber = null;

/**
 * Initialize the Redis subscriber and set up presence update broadcasting.
 * This module handles the Redis pub/sub → WebSocket broadcast wiring
 * without creating circular dependencies.
 */
export function initializePresenceBroadcaster() {
  if (redisSubscriber) {
    console.log("[PRESENCE] Broadcaster already initialized");
    return;
  }

  redisSubscriber = new Redis({
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

  console.log("[PRESENCE] Broadcaster initialized and subscribed to presence:updates");
}

/**
 * Clean up the Redis subscriber connection
 */
export function cleanupPresenceBroadcaster() {
  if (redisSubscriber) {
    redisSubscriber.quit();
    redisSubscriber = null;
    console.log("[PRESENCE] Broadcaster cleaned up");
  }
}
