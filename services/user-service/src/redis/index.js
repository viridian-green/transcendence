import Redis from "ioredis";

const redis = new Redis({
    host: process.env.REDIS_HOST || "redis",
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6378,
    password: process.env.REDIS_PASSWORD || undefined,
});

export default redis;
