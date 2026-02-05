// src/redis/subscribers.ts
import Redis from "ioredis";
import { WebSocket } from "ws";

if (!process.env.REDIS_HOST) {
  console.error('ERROR: REDIS_HOST environment variable is required');
  process.exit(1);
}
if (!process.env.REDIS_PORT) {
  console.error('ERROR: REDIS_PORT environment variable is required');
  process.exit(1);
}

export const wsByUserId: Map<string, WebSocket> = new Map();

const redisSubscriber = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT, 10),
});

// Attach the message handler ONCE
export function setupSubscribers() {
  redisSubscriber.on("message", (channel: string, message: string) => {
    if (channel === "chat:general") {
        wsByUserId.forEach((ws, userId) => {
        if (ws.readyState === ws.OPEN)
          ws.send(message);
      });
    } else if (channel.startsWith("user:")) {
      const userId = channel.split(":")[1];
      const ws = wsByUserId.get(userId);
      if (ws && ws.readyState === ws.OPEN) {
        ws.send(message);
      }
    }
  });
  redisSubscriber.on("error", (err: any) => {
    console.error("Redis subscriber error:", err);
  });
}

export function subscribeGeneralChat() {
  redisSubscriber.subscribe("chat:general", (err: any) => {
    if (err) {
      console.error("Failed to subscribe to general chat:", err);
    }
  });
}

export function subscribeUserChannel(userId: string) {
  redisSubscriber.subscribe(`user:${userId}`, (err: any) => {
    if (err) {
      console.error(`Failed to subscribe to user channel ${userId}:`, err);
    }
  });
}

export function unsubscribeUserChannel(userId: string) {
  redisSubscriber.unsubscribe(`user:${userId}`, (err: any) => {
    if (err) {
      console.error(`Failed to unsubscribe from user channel ${userId}:`, err);
    }
  });
}
