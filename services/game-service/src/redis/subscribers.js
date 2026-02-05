import Redis from "ioredis";

const redisSubscriber = new Redis({
  host: process.env.REDIS_HOST || "redis",
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

// Subscribe to presence updates from Redis
redisSubscriber.subscribe("presence:updates", (err, count) => {
  if (err) {
    console.error("[GAME-SERVICE] Failed to subscribe to presence:updates:", err);
  }
});

redisSubscriber.on("message", (channel, message) => {
  if (channel === "presence:updates") {
    try {
      const data = JSON.parse(message);
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
