import { WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { updateUserState } from "../utils/userStateApi.js";

export interface User {
  id: string;
  username: string;
  state?: string; // e.g., "online", "offline", "busy"
}

const clients: Map<WebSocket, User> = new Map();

const socketsByUserId: Map<string, Set<WebSocket>> = new Map();

// Main WebSocket handler function (not exported directly)
export default function chatsocketsHandler(connection: WebSocket, request: any) {
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

// Helpers
function extractUserFromJWT(request: any): User | null {
  // const cookieHeader = request.headers["cookie"] as string | undefined;

  const url = new URL(request.url, 'http://localhost');
  const fakeUser = url.searchParams.get('user');

  if (fakeUser === 'alice') {
    return { id: 'u1', username: 'alice' };
  }
  if (fakeUser === 'user2') {
    return { id: 'u2', username: 'user2' };
  }

  // Fallback if no param / unknown
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

// function handleConnection(connection: WebSocket, user: User) {
//   clients.set(connection, user);
//   console.log(
//     `User ${user.username} connected. Total clients: ${clients.size}`
//   );
//   connection.send(
//     JSON.stringify({
//       type: "welcome",
//       message: `Welcome, ${user.username}!`,
//       user: { id: user.id, username: user.username },
//     })
//   );
//   // Broadcast to all other clients that this user joined
//   broadcastToOthers(connection, {
//     type: "user_joined",
//     user: { id: user.id, username: user.username },
//   });
// }

// function handleMessage(
//   connection: WebSocket,
//   user: User,
//   message: string | Buffer
// ) {
//   const text = typeof message === "string" ? message : message.toString();
//   console.log(`Received from ${user.username}:`, text);
//   // Broadcast to all connected clients
//   broadcastAll({
//     type: "message",
//     user: { id: user.id, username: user.username },
//     text,
//   });
// }

// function handleDisconnect(connection: WebSocket, user: User) {
//   clients.delete(connection);
//   console.log(
//     `User ${user.username} disconnected. Total clients: ${clients.size}`
//   );
//   // Notify others that user left
//   broadcastAll({
//     type: "user_left",
//     user: { id: user.id, username: user.username },
//   });
// }

// Helper to broadcast to all clients
function broadcastAll(payload: any) {
  for (const [client] of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  }
}

// Helper to broadcast to all except one
function broadcastToOthers(except: WebSocket, payload: any) {
  for (const [client] of clients) {
    if (client !== except && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  }
}

function handleConnection(connection: WebSocket, user: User) {
  clients.set(connection, user);

  // index by userId for direct messaging
  let set = socketsByUserId.get(user.id);
  if (!set) {
    set = new Set();
    socketsByUserId.set(user.id, set);
  }
  set.add(connection);

  console.log(
    `User ${user.username} connected. Total clients: ${clients.size}`
  );
  connection.send(
    JSON.stringify({
      type: "welcome",
      message: `Welcome, ${user.username}!`,
      user: { id: user.id, username: user.username },
    })
  );
  broadcastToOthers(connection, {
    type: "user_joined",
    user: { id: user.id, username: user.username },
  });
}

function handleDisconnect(connection: WebSocket, user: User) {
  clients.delete(connection);

  const set = socketsByUserId.get(user.id);
  if (set) {
    set.delete(connection);
    if (set.size === 0) socketsByUserId.delete(user.id);
  }

  console.log(
    `User ${user.username} disconnected. Total clients: ${clients.size}`
  );
  broadcastAll({
    type: "user_left",
    user: { id: user.id, username: user.username },
  });
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
    broadcastAll({
      type: 'message',
      user: { id: user.id, username: user.username },
      text,
    });
    return;
  }

  // switch on type
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
  const inviterUsername = String(data.fromUsername);

  const gameId = `game-${Date.now()}`;

  console.log(
    'INVITE_ACCEPT from',
    invitedId,
    'for inviter',
    inviterId,
    'gameId',
    gameId,
  );



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

// default: normal chat broadcast
broadcastAll({
  type: 'message',
  user: { id: user.id, username: user.username },
  text: data.text ?? text,
});

}