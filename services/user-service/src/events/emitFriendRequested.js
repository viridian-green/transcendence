import redis from "../redis/index.js";
import { getUsernameById } from "../services/user.service.js";

export async function emitFriendRequested(app, fromUserId, toUserId) {
    // Ensure both IDs are numbers
    const fromId = Number(fromUserId);
    const toId = Number(toUserId);
    const username = await getUsernameById(app, fromId);

    const event = {
        type: "friend.requested",
        fromUserId: fromId,
        fromUsername: username,
        toUserId: toId,
        at: new Date().toISOString(),
    };

    await redis.publish(
        "notifications.events",
        JSON.stringify(event)
    );
}

export async function emitFriendAccepted(app, fromUserId, toUserId) {
    const fromId = Number(fromUserId);
    const toId = Number(toUserId);
    const username = await getUsernameById(app, fromId);

    const event = {
        type: "friend.accepted",
        fromUserId: fromId,
        fromUsername: username,
        toUserId: toId,
        at: new Date().toISOString(),
    };

    await redis.publish(
        "notifications.events",
        JSON.stringify(event)
    );
}

export async function emitFriendRejected(app, fromUserId, toUserId) {
    const fromId = Number(fromUserId);
    const toId = Number(toUserId);
    const username = await getUsernameById(app, fromId);
   
    const event = {
        type: "friend.rejected",
        fromUserId: fromId,
        fromUsername: username,
        toUserId: toId,
        at: new Date().toISOString(),
    };
 
    await redis.publish(
        "notifications.events",
        JSON.stringify(event)
    );

}  
