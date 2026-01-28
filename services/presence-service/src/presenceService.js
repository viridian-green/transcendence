import { redisClient, redisPublisher } from "./redis.js";

const ALLOWED_STATES = ["online", "busy", "offline"];

export async function updateUserState(userId, state) {
    if (!ALLOWED_STATES.includes(state)) {
      throw new Error(`Invalid state. Allowed: ${ALLOWED_STATES.join(", ")}`);
    }
    try {
      await redisClient.set(`user:state:${userId}`, state);
      await redisPublisher.publish(
        "presence:updates",
        JSON.stringify({ userId, state, timestamp: Date.now() })
      );
      console.log(`User ${userId} state updated to ${state}`);
    } catch (err) {
      console.error(`Failed to update user state for ${userId}:`, err);
      throw new Error("Failed to update user state in Redis");
    }
  }
export async function getUserState(userId) {
    try {
      const state = await redisClient.get(`user:state:${userId}`);
      return state || "offline";
    } catch (err) {
      console.error(`Failed to get user state for ${userId}:`, err);
      return "offline";
    }
  }
export async function getOnlineUsers() {
    try {
      const keys = await redisClient.keys("user:state:*");
      if (!keys.length)
        return [];

      const states = await redisClient.mget(...keys);
      return keys
        .map((key, i) =>
          states[i] === "online" ? key.replace("user:state:", "") : null
        )
        .filter((id) => id !== null);
    } catch (err) {
      console.error("Failed to get online users:", err);
      return [];
    }
  }
export async function isUserOnline(userId) {
    const state = await this.getUserState(userId);
    return state === "online";
  }