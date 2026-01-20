import fetch from "node-fetch";

const PRESENCE_BASE_URL =
  process.env.PRESENCE_SERVICE_URL || "http://presence:3005";

export async function updateUserState(id: string, state: string) {
  const url = `${PRESENCE_BASE_URL}/state`;
  try {
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, state }),
    });
    if (!res.ok) {
      console.error(
        `[userStateApi] Failed to update user state in presence service: ${res.status} ${res.statusText}`
      );
    }
  } catch (err) {
    console.error("[userStateApi] Error updating user state via presence service:", err);
  }
}
