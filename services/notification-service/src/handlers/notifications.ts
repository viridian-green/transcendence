import { WebSocket } from "ws";
import jwt from "jsonwebtoken";

export interface User {
  id: string;
  username: string;
  state?: string; // Allowed: "online", "offline", "busy"
}

const clients: Map<WebSocket, User> = new Map();

export const socketsByUserId: Map<string, Set<WebSocket>> = new Map();

// Main WebSocket handler function
export default function notificationsHandler(connection: WebSocket, request: any) {
  const user = extractUserFromJWT(request);
  if (!user) {
    connection.send(JSON.stringify({ error: "Authentication required xxx" }));
    connection.close();
    return;
  }
  handleConnection(connection, user);
  connection.on("message", (message: string | Buffer) =>
    handleMessage(connection, user, message)
  );
  connection.on("close", () => handleDisconnect(connection, user));
}

// Helpers
function extractUserFromJWT(request: any): User | null {
  const cookieHeader = request.headers["cookie"] as string | undefined;

//   Fallback if no param / unknown
  let cookies: Record<string, string> = {};

  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      if (parts.length === 2) {
        cookies[parts[0].trim()] = decodeURIComponent(parts[1].trim());
      }
    });
  }
  const accessToken = cookies["access_token"];
  const jwtSecret = process.env.JWT_SECRET;
  if (accessToken && jwtSecret) {
    try {
      const decoded = jwt.verify(accessToken, jwtSecret) as any;
      if (decoded.username && decoded.id) {
        return { username: decoded.username, id: String(decoded.id) };
      }
    } catch (err) {
      console.error("Invalid JWT:", err);
      return null;
    }
  }
  return null;
}

function handleConnection(connection: WebSocket, user: User) {
  clients.set(connection, user);

  // Index by userId for direct messaging (ensure it's a string)
  const userId = String(user.id);
  let set = socketsByUserId.get(userId);
  if (!set) {
    set = new Set();
    socketsByUserId.set(userId, set);
  }
  set.add(connection);

  console.log(
    `[NOTIFICATION WS] User ${user.username} (id: ${userId}, type: ${typeof userId}) connected. Total clients: ${clients.size}`
  );

  // Send welcome message
  connection.send(
    JSON.stringify({
      type: "welcome",
      message: `Notification service connected, ${user.username}!`,
      user: { id: user.id, username: user.username },
    })
  );


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
  console.log('WS raw from', user.username, ':', text);

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    // plain chat text
    return;
  }

// switch on type
if (data.type === 'INVITE') {
  const toUserId = String(data.toUserId);
  console.log('Handling INVITE from', user.id, 'to', toUserId);

  const targets = socketsByUserId.get(toUserId);
  console.log('Targets for', toUserId, ':', targets?.size ?? 0);
  if (!targets) {
    console.log('No sockets for target', toUserId);
    return;
  }

  for (const sock of targets) {
    if (sock.readyState === WebSocket.OPEN) {
      sock.send(
        JSON.stringify({
          type: 'INVITE_RECEIVED',
          fromUserId: user.id,
          fromUsername: user.username,
          gameMode: data.gameMode ?? 'pong',
        }),
      );
    }
  }

  return;
}

if (data.type === 'INVITE_ACCEPT') {
  // user = the one who clicked Accept
  const invitedId = user.id;
  const inviterId = String(data.fromUserId);
  const invitedUsername = user.username;

  // Look up inviter's username from socketsByUserId or clients
  let inviterUsername = 'undefined';
  const inviterSockets = socketsByUserId.get(inviterId);
  if (inviterSockets && inviterSockets.size > 0) {
    // Get the first socket and its user
    for (const sock of inviterSockets) {
      const inviterUser = clients.get(sock);
      if (inviterUser && inviterUser.username) {
        inviterUsername = inviterUser.username;
        break;
      }
    }
  }

  const gameId = `game-${Date.now()}`;

  console.log("---------------------> invited user", invitedUsername, "---------------------> inviter user" ,inviterUsername);

  const notifyUser = (userId: string, payload: any) => {
    const targets = socketsByUserId.get(userId);
    console.log('Targets for', userId, ':', targets?.size ?? 0);
    if (!targets) return;
    for (const sock of targets) {
      if (sock.readyState === WebSocket.OPEN) {
        sock.send(JSON.stringify(payload));
      }
    }
  };

  notifyUser(inviterId, {
    type: 'GAME_START',
    gameId,
    leftPlayerId: inviterId,
    rightPlayerId: invitedId,
    leftPlayer: inviterUsername,
    rightPlayer: invitedUsername,
    yourSide: 'left'
  });

  notifyUser(invitedId, {
    type: 'GAME_START',
    gameId,
    leftPlayerId: inviterId,
    rightPlayerId: invitedId,
    leftPlayer: inviterUsername,
    rightPlayer: invitedUsername,
    yourSide: 'right'
  });

  return;
}
}