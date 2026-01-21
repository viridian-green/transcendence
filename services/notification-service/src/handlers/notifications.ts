import { WebSocket } from "ws";
import jwt from "jsonwebtoken";

export interface User {
  id: string;
  username: string;
}

export interface Notification {
  id: string;
  type: 'game_invite' | 'friend_request' | 'friend_accepted' | 'game_start' | 'game_end' | 'message' | 'system';
  title: string;
  message: string;
  userId: string;
  fromUserId?: string;
  fromUsername?: string;
  read: boolean;
  createdAt: Date;
  metadata?: Record<string, any>;
}

const clients: Map<WebSocket, User> = new Map();
const socketsByUserId: Map<string, Set<WebSocket>> = new Map();
const notificationsByUserId: Map<string, Notification[]> = new Map();

// Main WebSocket handler function
export default function notificationsHandler(connection: WebSocket, request: any) {
  const user = extractUserFromJWT(request);
  if (!user) {
    connection.send(JSON.stringify({ error: "Authentication required" }));
    connection.close();
    return;
  }
  handleConnection(connection, user);
  connection.on("message", (message: string | Buffer) =>
    handleMessage(connection, user, message)
  );
  connection.on("close", () => handleDisconnect(connection, user));
}

// Extract user from JWT token
function extractUserFromJWT(request: any): User | null {
  const url = new URL(request.url, 'http://localhost');
  const fakeUser = url.searchParams.get('user');

  // Temporary fake users for development (same as chat-service)
  if (fakeUser === 'alice') {
    return { id: 'u1', username: 'alice' };
  }
  if (fakeUser === 'user2') {
    return { id: 'u2', username: 'user2' };
  }

  // TODO: Implement real JWT extraction from cookies
  // const cookieHeader = request.headers["cookie"] as string | undefined;
  // let cookies: Record<string, string> = {};
  // if (cookieHeader) {
  //   cookieHeader.split(";").forEach((cookie) => {
  //     const parts = cookie.split("=");
  //     if (parts.length === 2) {
  //       cookies[parts[0].trim()] = decodeURIComponent(parts[1].trim());
  //     }
  //   });
  // }
  // const accessToken = cookies["access_token"];
  // const jwtSecret = process.env.JWT_SECRET;
  // if (accessToken && jwtSecret) {
  //   try {
  //     const decoded = jwt.verify(accessToken, jwtSecret) as any;
  //     if (decoded.username && decoded.id) {
  //       return { username: decoded.username, id: String(decoded.id) };
  //     }
  //   } catch (err) {
  //     console.error("Invalid JWT:", err);
  //     return null;
  //   }
  // }
  return null;
}

// Send notification to specific user
export function sendNotificationToUser(userId: string, notification: Notification) {
  // Ensure notification has required fields
  if (!notification.id) {
    notification.id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  if (!notification.createdAt) {
    notification.createdAt = new Date();
  }
  notification.userId = userId;

  const sockets = socketsByUserId.get(userId);

  // Store notification regardless of online status
  const notifications = notificationsByUserId.get(userId) || [];
  notifications.push(notification);
  // Keep only last 100 notifications per user
  if (notifications.length > 100) {
    notifications.shift();
  }
  notificationsByUserId.set(userId, notifications);

  // Send to all user's connected sockets if online
  if (sockets && sockets.size > 0) {
    for (const socket of sockets) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: "notification",
          payload: notification,
        }));
      }
    }
  }
}

// Helper to create game invite notification
export function createGameInviteNotification(
  toUserId: string,
  fromUserId: string,
  fromUsername: string,
  gameMode: string = 'pong'
): Notification {
  return {
    id: `game-invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'game_invite',
    title: 'Game Invitation',
    message: `${fromUsername} invited you to play ${gameMode}`,
    userId: toUserId,
    fromUserId,
    fromUsername,
    read: false,
    createdAt: new Date(),
    metadata: { gameMode },
  };
}

// Helper to create friend request notification
export function createFriendRequestNotification(
  toUserId: string,
  fromUserId: string,
  fromUsername: string
): Notification {
  return {
    id: `friend-request-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'friend_request',
    title: 'Friend Request',
    message: `${fromUsername} sent you a friend request`,
    userId: toUserId,
    fromUserId,
    fromUsername,
    read: false,
    createdAt: new Date(),
  };
}

// Broadcast notification to all users
export function broadcastNotification(notification: Omit<Notification, 'userId'>) {
  for (const [userId] of socketsByUserId) {
    const userNotification: Notification = {
      ...notification,
      userId,
      id: `${notification.id}-${userId}`,
    };
    sendNotificationToUser(userId, userNotification);
  }
}

function handleConnection(connection: WebSocket, user: User) {
  clients.set(connection, user);

  // Index by userId for direct messaging
  let set = socketsByUserId.get(user.id);
  if (!set) {
    set = new Set();
    socketsByUserId.set(user.id, set);
  }
  set.add(connection);

  console.log(
    `[NOTIFICATION WS] User ${user.username} connected. Total clients: ${clients.size}`
  );

  // Send welcome message
  connection.send(
    JSON.stringify({
      type: "welcome",
      message: `Notification service connected, ${user.username}!`,
      user: { id: user.id, username: user.username },
    })
  );

  // Send pending notifications
  const pendingNotifications = notificationsByUserId.get(user.id) || [];
  if (pendingNotifications.length > 0) {
    connection.send(
      JSON.stringify({
        type: "pending_notifications",
        count: pendingNotifications.length,
        notifications: pendingNotifications.slice(-10), // Last 10 notifications
      })
    );
  }
}

function handleDisconnect(connection: WebSocket, user: User) {
  clients.delete(connection);

  const set = socketsByUserId.get(user.id);
  if (set) {
    set.delete(connection);
    if (set.size === 0) socketsByUserId.delete(user.id);
  }

  console.log(
    `[NOTIFICATION WS] User ${user.username} disconnected. Total clients: ${clients.size}`
  );
}

function handleMessage(
  connection: WebSocket,
  user: User,
  message: string | Buffer,
) {
  const text = typeof message === 'string' ? message : message.toString();
  console.log('[NOTIFICATION WS] Message from', user.username, ':', text);

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    connection.send(JSON.stringify({
      type: "error",
      message: "Invalid JSON format",
    }));
    return;
  }

  switch (data.type) {
    case 'mark_read':
      // Mark notification as read
      const notificationId = data.notificationId;
      const notifications = notificationsByUserId.get(user.id) || [];
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        connection.send(JSON.stringify({
          type: "notification_read",
          notificationId,
        }));
      }
      break;

    case 'mark_all_read':
      // Mark all notifications as read
      const allNotifications = notificationsByUserId.get(user.id) || [];
      allNotifications.forEach(n => n.read = true);
      connection.send(JSON.stringify({
        type: "all_notifications_read",
      }));
      break;

    case 'get_notifications':
      // Get all notifications for user
      const userNotifications = notificationsByUserId.get(user.id) || [];
      connection.send(JSON.stringify({
        type: "notifications_list",
        notifications: userNotifications,
      }));
      break;

    default:
      connection.send(JSON.stringify({
        type: "error",
        message: `Unknown message type: ${data.type}`,
      }));
  }
}

