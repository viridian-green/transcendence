import Redis from "ioredis";
import { WebSocket } from "ws";

export const wsByUserId: Map<string, WebSocket> = new Map();

const redisSubscriber = new Redis({
  //Check if all these envs can be replaced by process.envREDIS_URL
  host: process.env.REDIS_HOST || "redis",
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});


redisSubscriber.subscribe("presence:updates", (message: string) => {
  try {
    const data = JSON.parse(message);
    console.log(`[PRESENCE] Broadcasting state update: ${data.userId} -> ${data.state}`);
    
    // Send to ALL presence WS clients
    const updateMsg = JSON.stringify({
      type: "userStateChanged", 
      userId: data.userId,
      state: data.state
    });
    
    for (const conn of wsByUserId.values()) {
      if (conn.readyState === WebSocket.OPEN) {
        conn.send(updateMsg);
      }
    }
  } catch (err) {
    console.error("[PRESENCE] Redis message parse error:", err);
  }
});

export function broadcastPresenceUpdate() {
  const msg = JSON.stringify({ type: "onlineUsersUpdated" });
  for (const conn of wsByUserId.values()) {
    if (conn.readyState === WebSocket.OPEN) {
      conn.send(msg);
    }
  }
}


export const redisPublisher = new Redis({
  host: process.env.REDIS_HOST || "redis",
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
password: process.env.REDIS_PASSWORD || undefined,
});