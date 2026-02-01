import Redis from "ioredis";
import { handleFriendRequested } from "../handlers/handleFriendRequested.js";

const redisSubscriber = new Redis({
    host: process.env.REDIS_HOST || "redis",
    port: process.env.REDIS_PORT
        ? parseInt(process.env.REDIS_PORT)
        : 6379,
    password: process.env.REDIS_PASSWORD || undefined,
});

export function setupNotificationSubscriber() {
    redisSubscriber.on("connect", () => {
        console.log("[REDIS SUBSCRIBER] Connected to Redis");
    });

    redisSubscriber.on("error", (err) => {
        console.error("[REDIS SUBSCRIBER] Error:", err);
    });

    redisSubscriber.on("message", (channel, message) => {
        console.log(`[REDIS SUBSCRIBER] Received message on channel: ${channel}`);
        if (channel !== "notifications.events") return;

        let event;
        try {
            event = JSON.parse(message);
            console.log(`[REDIS SUBSCRIBER] Parsed event:`, event);
        } catch (err) {
            console.error("[REDIS SUBSCRIBER] Invalid JSON:", message, err);
            return;
        }

        if (event.type === "friend.requested") {
            console.log(`[REDIS SUBSCRIBER] Handling friend.requested event`);
            handleFriendRequested(event);
        } else {
            console.log(`[REDIS SUBSCRIBER] Unknown event type: ${event.type}`);
        }
    });

    redisSubscriber.subscribe("notifications.events", (err) => {
        if (err) {
            console.error("[REDIS SUBSCRIBER] Failed to subscribe:", err);
        } else {
            console.log("[REDIS SUBSCRIBER] Successfully subscribed to notifications.events");
        }
    });
}
