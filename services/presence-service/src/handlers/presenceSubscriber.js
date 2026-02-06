import { redisSubscriber } from "../redis.js";
import { updateUserState } from "../presenceService.js";

// Redis subscriber for presence:state channel
export function startPresenceStateSubscriber() {
  redisSubscriber.subscribe("presence:state", (err, count) => {
    if (err) {
      console.error("Failed to subscribe to presence:state:", err);
      return;
    }
    console.log(`Subscribed to presence:state (${count} channels)`);
  });

  redisSubscriber.on("message", async (channel, message) => {
    if (channel === "presence:state") {
      try {
        const { userId, state } = JSON.parse(message);
        if (userId && state) {
          await updateUserState(userId, state);
          console.log(`Presence state updated from Redis: ${userId} -> ${state}`);
        }
      } catch (err) {
        console.error("Error handling presence:state message:", err);
      }
    }
  });
}
