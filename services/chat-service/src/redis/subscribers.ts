// src/redis/subscribers.ts
import Redis from "ioredis";
import { Server as SocketIOServer } from "socket.io";

const redisSubscriber = new Redis({
  //Check if all these envs can be replaced by process.envREDIS_URL
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6378,
  password: process.env.REDIS_PASSWORD || undefined,
});

export function setupPresenceSubscriber(io: SocketIOServer) {
  redisSubscriber.subscribe("presence:updates");

  redisSubscriber.on("message", async (channel, message) => {
    if (channel === "presence:updates") {
      // Optionally, parse message and log or use it
      // const { userId, state } = JSON.parse(message);
      // console.log(`User ${userId} is now ${state}`);
      io.emit("onlineUsersUpdated");
    }
  });
}
