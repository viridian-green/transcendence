import Redis from "ioredis";
import { WebSocket } from "ws";

const redisSubscriber = new Redis({
  //Check if all these envs can be replaced by process.envREDIS_URL
  host: process.env.REDIS_HOST || "redis",
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});
// Subscribe to presence updates from Redis
redisSubscriber.subscribe("presence:updates", (err: any, count: any) => {
  if (err) {
    console.error("[GAME-SERVICE] Failed to subscribe to presence:updates:", err);
  } else {
    console.log(`[GAME-SERVICE] Subscribed to ${count} channel(s)`);
  }
});

redisSubscriber.on("message", (channel: string, message: string) => {
  if (channel === "presence:updates") {
    try {
      const data = JSON.parse(message);
      console.log(`[GAME-SERVICE] Received presence update: ${data.userId} -> ${data.state}`);
      
      
    } catch (err) {
      console.error("[GAME-SERVICE] Redis message parse error:", err);
    }
  }
});

export const redisPublisher = new Redis({
  host: process.env.REDIS_HOST || "redis",
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
password: process.env.REDIS_PASSWORD || undefined,
});