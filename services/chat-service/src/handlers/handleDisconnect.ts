import { WebSocket } from "ws";
import { User } from "./chatsockets";
import { updateUserState } from "../utils/userStateApi";

export function handleDisconnect(
  connection: WebSocket,
  user: User,
  clients: Map<WebSocket, User>
) {
  clients.delete(connection);
  user.state = "offline";
  updateUserState(user.id, user.state);
  console.log(
    `User ${user.username} disconnected. Total clients: ${clients.size}`
  );
  broadcastAll(
    {
      type: "user_left",
      user: { id: user.id, username: user.username, state: user.state },
    },
    clients
  );
  broadcastAll(
    {
      type: "user_state",
      user: { id: user.id, username: user.username, state: user.state },
    },
    clients
  );
}

function broadcastAll(payload: any, clients: Map<WebSocket, User>) {
  for (const [client] of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  }
}
