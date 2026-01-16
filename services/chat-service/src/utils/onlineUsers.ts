import redis from "../redis/index";

/**
 * Get a list of online user IDs from Redis.
 * Assumes user states are stored as keys: user:state:<id> with value 'online'.
 */

export async function getOnlineUsers(): Promise<string[]> {
  const keys: string[] = await redis.keys("user:state:*");
  if (!keys.length) return [];
  const states: (string | null)[] = await redis.mget(...keys);
  return keys
    .map((key: string, i: number) =>
      states[i] === "online" ? key.replace("user:state:", "") : null
    )
    .filter((id: string | null): id is string => !!id);
}
