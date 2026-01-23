// src/redis/subscribers.ts
import Redis from "ioredis";
import { WebSocket } from "ws";

export const wsByUserId: Map<string, WebSocket> = new Map();

const redisSubscriber = new Redis({
  //Check if all these envs can be replaced by process.envREDIS_URL
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6378,
  password: process.env.REDIS_PASSWORD || undefined,
});

// Attach the  message handler ONCE
export function setupRedisSubscribers(io?: any) {
  redisSubscriber.on("message", (channel: string, message: string) => {
    if (channel === "presence:updates" && io) {
      io.emit("onlineUsersUpdated");
    } else if (channel === "chat:general") {
      wsByUserId.forEach((ws) => {
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
}

export function subscribePresenceUpdates() {
  redisSubscriber.subscribe("presence:updates");
}

export function subscribeGeneralChat() {
  redisSubscriber.subscribe("chat:general");
}

export function subscribeUserChannel(userId: string) {
  redisSubscriber.subscribe(`user:${userId}`);
}

export function unsubscribeUserChannel(userId: string) {
  redisSubscriber.unsubscribe(`user:${userId}`);
}
