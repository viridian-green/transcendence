import Redis from "ioredis";

const redisClient = new Redis({
  host: "redis",
  port: 6379,
});

const redisPublisher = new Redis({
  host: "redis",
  port: 6379,
});

export { redisPublisher, redisClient };