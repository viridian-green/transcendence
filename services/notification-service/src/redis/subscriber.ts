import Redis from "ioredis";
import { handleFriendRequested, handleFriendAccepted, handleFriendRejected, handleFriendDeleted } from "../handlers/handleFriendRequested.js";

const redisSubscriber = new Redis({
    host: "redis",
    port: 6379,
});

export function setupNotificationSubscriber() {
    redisSubscriber.on("connect", () => {
        console.log("[REDIS SUBSCRIBER] Connected to Redis");
    });

    redisSubscriber.on("error", (err) => {
        console.error("[REDIS SUBSCRIBER] Error:", err);
    });

    redisSubscriber.on("message", (channel, message) => {
        if (channel !== "notifications.events") return;

        let event;
        try {
            event = JSON.parse(message);
            console.log(`[REDIS SUBSCRIBER] Parsed event:`, event);
        } catch (err) {
            return;
        }

        if (event.type === "FRIEND_INVITE_RECEIVED") {
            handleFriendRequested(event);
        } else if (event.type === "FRIEND_INVITE_ACCEPTED") {
            handleFriendAccepted(event);
        } else if (event.type === "FRIEND_INVITE_REJECTED") {
            handleFriendRejected(event);
        } else if (event.type === "FRIEND_DELETED") {
            handleFriendDeleted(event);
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
