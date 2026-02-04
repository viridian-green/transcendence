import redis from "../redis/index.js";
import { getUsernameById } from "../services/user.service.js";

export async function emitFriendRequested(app, fromUserId, toUserId) {
    // Ensure both IDs are numbers
    const fromId = Number(fromUserId);
    const toId = Number(toUserId);
    const username = await getUsernameById(app, fromId);

    const event = {
        type: "FRIEND_INVITE_RECEIVED",
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
        type: "FRIEND_INVITE_ACCEPTED",
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
        type: "FRIEND_INVITE_REJECTED",
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

export async function emitFriendDeleted(app, fromUserId, toUserId) {
    const fromId = Number(fromUserId);
    const toId = Number(toUserId);
    const username = await getUsernameById(app, fromId);
   
    const event = {
        type: "FRIEND_DELETED",
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
