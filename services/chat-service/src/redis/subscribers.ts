// src/redis/subscribers.ts
import Redis from "ioredis";
import { WebSocket } from "ws";

export const wsByUserId: Map<string, WebSocket> = new Map();

const redisSubscriber = new Redis({
  //Check if all these envs can be replaced by process.envREDIS_URL
  host: process.env.REDIS_HOST || "redis",
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6378,
  password: process.env.REDIS_PASSWORD || undefined,
});

// Attach the  message handler ONCE
export function setupSubscribers(io?: any) {
  redisSubscriber.on("message", (channel: string, message: string) => {
    if (channel === "presence:updates" && io) {
      io.emit("onlineUsersUpdated");
    } else if (channel === "chat:general") {
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
