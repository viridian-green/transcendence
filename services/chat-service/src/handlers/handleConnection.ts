import { WebSocket } from "ws";
import { User } from "../types.js";

export function handleConnection(
  connection: WebSocket,
  user: User,
  clients: Map<WebSocket, User>
) {
  clients.set(connection, user);
  connection.send(
    JSON.stringify({
      type: "welcome",
      message: `Welcome, ${user.username}!`,
      user: { id: user.id, username: user.username, state: user.state },
    })
  );
  // Broadcast to all other clients that this user joined and is online
  broadcastToOthers(
    connection,
    {
      type: "user_joined",
      user: { id: user.id, username: user.username, state: user.state },
    },
    clients
  );
}

function broadcastToOthers(
  except: WebSocket,
  payload: any,
  clients: Map<WebSocket, User>
) {
  for (const [client] of clients) {
    if (client !== except && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  }
}
