import { WebSocket } from "ws";
import { User } from "../types.js";
import Redis from "ioredis";

const MESSAGE_MAX_LENGTH = 5000;
const messageRateLimits: Map<string, number[]> = new Map();
const RATE_LIMIT_WINDOW = 10000; // 10 seconds
const RATE_LIMIT_MAX = 20; // 20 messages per window

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userMessages = messageRateLimits.get(userId) || [];
  
  // Filter out old timestamps
  const recentMessages = userMessages.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW
  );
  
  if (recentMessages.length >= RATE_LIMIT_MAX) {
    return false; // Rate limit exceeded
  }
  
  recentMessages.push(now);
  messageRateLimits.set(userId, recentMessages);
  return true;
}

export function handleMessage(
  connection: WebSocket,
  user: User,
  message: string | Buffer,
  redisPublisher: Redis
) {

  if (!checkRateLimit(user.id)) {
  connection.send(
    JSON.stringify({
      type: "error",
      error: "Rate limit exceeded. Please slow down.",
    })
  );
  return;
  }

  let payload: any;
  try {
    payload =
      typeof message === "string"
        ? JSON.parse(message)
        : JSON.parse(message.toString());
  } catch {
    connection.send(JSON.stringify({ error: "Invalid message format" }));
    return;
  }

  // Validate message length
  if (payload.text && payload.text.length > MESSAGE_MAX_LENGTH) {
    connection.send(
      JSON.stringify({
        type: "error",
        error: `Message too long. Maximum ${MESSAGE_MAX_LENGTH} characters.`,
      })
    );
    return;
  }

  if (payload.type === "private_msg" && payload.to && payload.text) {
    const msg = JSON.stringify({
      type: "private_msg",
      from: { id: user.id, username: user.username },
      text: payload.text,
      timestamp: Date.now(),
    });

    redisPublisher.publish(`user:${payload.to}`, msg).catch((err:any) => {
      console.error(`Failed to publish private message:`, err);
    });
  } else if (payload.type === "general_msg" && payload.text) {
    const msg = JSON.stringify({
      type: "general_msg",
      user: { id: user.id, username: user.username },
      text: payload.text,
      timestamp: Date.now(),
    });

    redisPublisher.publish("chat:general", msg, (err:any) => {
      if (err) {
        console.error(`Failed to publish general message:`, err);
      }
    });
  } else {
    connection.send(JSON.stringify({ type: "error", error: "Invalid message payload" }));
  }
}
