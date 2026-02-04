import WebSocket from "ws";
import { updateUserState, getAllUsersState } from "../presenceService.js";
import { extractUserFromJWT } from "../utils/extractUserFromJWT.js";

// Track active connections
export const activeConnections = new Map();
const heartbeatIntervals = new Map();

export async function handlePresenceConnection(connection, request) {
  const user = extractUserFromJWT(request);
  if (!user) {
    console.log('Extracted user from JWT: null');
    connection.send(
      JSON.stringify({ error: "Authentication required" })
    );
    connection.close();
    return;
  }

  // Set user online immediately
  updateUserState(user.id, "online");

  // Store connection
  activeConnections.set(user.id, connection);

  // Send welcome message
  connection.send(
    JSON.stringify({
      type: "connected",
      message: "Presence tracking started",
      state: "online",
    })
  );

  // Send initial presence state of all users
  try {
    const users = await getAllUsersState();
    if (connection.readyState === WebSocket.OPEN) {
      connection.send(
        JSON.stringify({
          type: "presence_update",
          users: users,
        })
      );
    }
  } catch (err) {
    console.error(`Failed to send initial presence state to ${user.username}:`, err);
  }

  // Start heartbeat mechanism
  const heartbeatInterval = setInterval(() => {
    if (connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify({ type: "ping", timestamp: Date.now() }));
    } else {
      clearInterval(heartbeatInterval);
    }
  }, 30000); // Ping every 30 seconds

  heartbeatIntervals.set(user.id, heartbeatInterval);

  // Handle incoming messages
  connection.on("message", async (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === "pong") {
        // User responded to ping - still alive
        console.log(`Heartbeat received from ${user.username}`);
      } else if (data.type === "state_change" && data.state) {
        // Manual state change (e.g., user sets status to "busy")
        await updateUserState(user.id, data.state);
        connection.send(
          JSON.stringify({
            type: "state_updated",
            state: data.state,
          })
        );
      }
    } catch (err) {
      console.error(`Error handling message from ${user.username}:`, err);
      connection.send(
        JSON.stringify({
          error: "Invalid message format",
        })
      );
    }
  });
  // Handle disconnection
  connection.on("close", async () => {
    console.log(`User ${user.username} disconnected from presence service`);

    // Clear heartbeat interval
    const interval = heartbeatIntervals.get(user.id);
    if (interval) {
      clearInterval(interval);
      heartbeatIntervals.delete(user.id);
    }

    // Remove from active connections
    activeConnections.delete(user.id);

    // Set user offline
    await updateUserState(user.id, "offline");
  });

  // Handle errors
  connection.on("error", (error) => {
    console.error(`WebSocket error for ${user.username}:`, error);
  });
}

export function getActiveConnection(userId) {
  return activeConnections.get(userId);
}

// Broadcast presence update to all active WebSocket clients
export function broadcastPresenceUpdate() {
  const msg = JSON.stringify({ type: "onlineUsersUpdated" });
  for (const conn of activeConnections.values()) {
    if (conn.readyState === WebSocket.OPEN) {
      conn.send(msg);
    }
  }
}