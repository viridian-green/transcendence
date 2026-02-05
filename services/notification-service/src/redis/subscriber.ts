import Redis from "ioredis";
import { handleFriendRequested, handleFriendAccepted, handleFriendRejected, handleFriendDeleted } from "../handlers/handleFriendRequested.js";

if (!process.env.REDIS_HOST) {
    console.error('ERROR: REDIS_HOST environment variable is required');
    process.exit(1);
}
if (!process.env.REDIS_PORT) {
    console.error('ERROR: REDIS_PORT environment variable is required');
    process.exit(1);
}

const redisSubscriber = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
});

export function setupNotificationSubscriber() {
    redisSubscriber.on("connect", () => {
    });

    redisSubscriber.on("error", (err) => {
        console.error("[REDIS SUBSCRIBER] Error:", err);
    });

    redisSubscriber.on("message", (channel, message) => {
        if (channel !== "notifications.events") return;

        let event;
        try {
            event = JSON.parse(message);
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
        }
    });
}
