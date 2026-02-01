import { socketsByUserId } from "./notifications.js";
import { WebSocket } from "ws";

export async function handleFriendRequested(event) {
    console.log(
        `🔔 Friend request from ${event.fromUserId} (${typeof event.fromUserId}) to ${event.toUserId} (${typeof event.toUserId})`
    );
    console.log(`Available user IDs in socketsByUserId:`, Array.from(socketsByUserId.keys()));

    const recipientSockets = socketsByUserId.get(String(event.toUserId));

    if (!recipientSockets || recipientSockets.size === 0) {
        console.log(`No active WebSocket connections for user ${event.toUserId}`);
        console.log(`Tried to find: "${String(event.toUserId)}"`);
        return;
    }

    // Send notification to all connected clients of the recipient
    const notification = {
        type: 'FRIEND_INVITE_RECEIVED',
        fromUserId: String(event.fromUserId),
        fromUsername: event.fromUsername,
    };

    for (const socket of recipientSockets) {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(notification));
            console.log(`Sent friend request notification to user ${event.toUserId}`);
        }
    }
}
