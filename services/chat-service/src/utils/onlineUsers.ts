import fetch from "node-fetch";

const PRESENCE_BASE_URL =
  process.env.PRESENCE_SERVICE_URL || "http://presence:3005";

export async function getOnlineUsers(): Promise<string[]> {
  const url = `${PRESENCE_BASE_URL}/online-users`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(
        `[onlineUsers] Failed to fetch online users from presence service: ${res.status} ${res.statusText}`
      );
      return [];
    }
    const data = (await res.json()) as { users?: string[] };
    return data.users ?? [];
  } catch (err) {
    console.error(
      "[onlineUsers] Error fetching online users from presence service:",
      err
    );
    return [];
  }
}
