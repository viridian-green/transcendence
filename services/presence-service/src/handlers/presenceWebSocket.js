import WebSocket from "ws";
import { updateUserState, getUserState, getOnlineUsers, isUserOnline } from "../presenceService.js";

// Track active connections
const activeConnections = new Map();
const heartbeatIntervals = new Map();

export function handlePresenceConnection(connection, request, user) {
  console.log(`User ${user.username} connected to presence service`);

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