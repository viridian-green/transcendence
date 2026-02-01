import redis from "../redis/index.js";
import { getUsernameById } from "../services/user.service.js";

export async function emitFriendRequested(app, fromUserId, toUserId) {
    // Ensure both IDs are numbers
    const fromId = Number(fromUserId);
    const toId = Number(toUserId);

    console.log('[EMIT FRIEND REQUESTED] Publishing event:', { fromId, toId, fromIdType: typeof fromId, toIdType: typeof toId });

    const username = await getUsernameById(app, fromId);

    const event = {
        type: "friend.requested",
        fromUserId: fromId,
        fromUsername: username,
        toUserId: toId,
        at: new Date().toISOString(),
    };

    console.log('[EMIT FRIEND REQUESTED] Event object:', JSON.stringify(event, null, 2));

    await redis.publish(
        "notifications.events",
        JSON.stringify(event)
    );

    console.log('[EMIT FRIEND REQUESTED] Published to Redis');
}