import fetch from "node-fetch";

export async function updateUserState(id: string, state: string) {
  const url = process.env.USER_SERVICE_URL || "http://user:3003/state";
  try {
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, state }),
    });
    if (!res.ok) {
      console.error(
        `[userStateApi] Failed to update user state: ${res.status} ${res.statusText}`
      );
    }
  } catch (err) {
    console.error("[userStateApi] Error updating user state:", err);
  }
}
