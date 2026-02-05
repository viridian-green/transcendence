import { socketsByUserId } from "./notifications.js";
import { WebSocket } from "ws";

export async function handleFriendRequested(event: {
    type: string;
    fromUserId: string | number;
    toUserId: string | number;
    fromUsername: string;
}) {

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

export async function handleFriendAccepted(event: {
    type: string;
    fromUserId: string | number;
    toUserId: string | number;
    fromUsername: string;
}) {
    // Notify the original inviter (toUserId) that their invite was accepted by fromUserId
    const senderId = String(event.toUserId);
    const targets = socketsByUserId.get(senderId);
    if (!targets)
        return;
    for (const socket of targets) {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(
                JSON.stringify({
                    type: "FRIEND_INVITE_ACCEPTED",
                    fromUserId: event.fromUserId,
                    fromUsername: event.fromUsername,
                })
            );
            console.log(`Sent friend accepted notification to user ${event.toUserId}`);
        }
    }

    const receiverId = String(event.fromUserId);
    const receiverTargets = socketsByUserId.get(receiverId);
    if (!receiverTargets)
        return;
    for (const socket of receiverTargets) {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(
                JSON.stringify({
                    type: "FRIEND_INVITE_CONFIRMED",
                    toUserId: event.toUserId,
                    toUsername: event.fromUsername,
                })
            );
        }
    }
}

export async function handleFriendRejected(event: {
    type: string;
    fromUserId: string | number;
    toUserId: string | number;
    fromUsername: string;
}) {
    // Notify the original inviter (toUserId) that their invite was rejected by fromUserId
    const senderId = String(event.toUserId);
    const targets = socketsByUserId.get(senderId);
    if (!targets) return;
    for (const socket of targets) {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(
                JSON.stringify({
                    type: "FRIEND_INVITE_REJECTED",
                    fromUserId: event.fromUserId,
                    fromUsername: event.fromUsername,
                })
            );
            console.log(`Sent friend rejected notification to user ${event.toUserId}`);
        }
    }
}

export async function handleFriendDeleted(event: {
    type: string;
    fromUserId: string | number;
    toUserId: string | number;
    fromUsername: string;
}) {
    // Notify both users that the friendship was deleted
    // The user who initiated the delete
    const initiatorId = String(event.fromUserId);
    const initiatorTargets = socketsByUserId.get(initiatorId);
    if (initiatorTargets) {
        for (const socket of initiatorTargets) {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(
                    JSON.stringify({
                        type: "FRIEND_DELETED",
                        fromUserId: event.fromUserId,
                        toUserId: event.toUserId,
                        fromUsername: event.fromUsername,
                    })
                );
            }
        }
    }

    // The user who was deleted
    const targetId = String(event.toUserId);
    const targetTargets = socketsByUserId.get(targetId);
    if (targetTargets) {
        for (const socket of targetTargets) {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(
                    JSON.stringify({
                        type: "FRIEND_UNFRIENDED",
                        fromUserId: event.fromUserId,
                        toUserId: event.toUserId,
                        fromUsername: event.fromUsername,
                    })
                );
            }
        }
    }
}

