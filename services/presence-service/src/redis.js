import Redis from "ioredis";

if (!process.env.REDIS_HOST) {
  console.error('ERROR: REDIS_HOST environment variable is required');
  process.exit(1);
}
if (!process.env.REDIS_PORT) {
  console.error('ERROR: REDIS_PORT environment variable is required');
  process.exit(1);
}

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT, 10),
});

const redisPublisher = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT, 10),
});

const redisSubscriber = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT, 10),
});

export { redisPublisher, redisClient, redisSubscriber };