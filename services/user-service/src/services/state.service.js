import fetch from "node-fetch";

const PRESENCE_BASE_URL =
  process.env.PRESENCE_SERVICE_URL || "http://presence:3005";

export async function checkIfStateIsValid(state) {
  const allowedStates = ["online", "busy", "offline"];
  if (!allowedStates.includes(state)) {
    const err = new Error(
      `Invalid state. Allowed states: ${allowedStates.join(", ")}`
    );
    err.statusCode = 400;
    throw err;
  }
}

export async function updateUserState(id, state) {
  try {
    const res = await fetch(`${PRESENCE_BASE_URL}/state`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, state }),
    });
    if (!res.ok) {
      const error = new Error(
        `Failed to update user state in presence service: ${res.status} ${res.statusText}`
      );
      error.statusCode = res.status;
      throw error;
    }
  } catch (err) {
    const error = new Error("Failed to update user state via presence service");
    error.statusCode = 500;
    throw error;
  }
}

export async function getUserState(id) {
  try {
    const res = await fetch(`${PRESENCE_BASE_URL}/state/${id}`);
    if (!res.ok) {
      const error = new Error(
        `Failed to get user state from presence service: ${res.status} ${res.statusText}`
      );
      error.statusCode = res.status;
      throw error;
    }
    const data = await res.json();
    return data.state || "offline";
  } catch (err) {
    const error = new Error("Failed to get user state via presence service");
    error.statusCode = 500;
    throw error;
  }
}