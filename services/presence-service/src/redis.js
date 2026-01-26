import Redis from "ioredis";

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6378,
  password: process.env.REDIS_PASSWORD || undefined,
});


const redisPublisher = new Redis(
  process.env.REDIS_URL || {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD || undefined,
  }
);

export { redisPublisher, redisClient };