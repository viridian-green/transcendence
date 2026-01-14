import redis from "../redis/index.ts";

/**
 * Get a list of online user IDs from Redis.
 * Assumes user states are stored as keys: user:state:<id> with value 'online'.
 */
export async function getOnlineUsers(): Promise<string[]> {
  const keys = await redis.keys("user:state:*");
  if (!keys.length) return [];
  const states = await redis.mget(...keys);
  return keys
    .map((key, i) =>
      states[i] === "online" ? key.replace("user:state:", "") : null
    )
    .filter((id): id is string => !!id);
}
