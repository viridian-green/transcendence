import { WebSocket } from "ws";
import { User } from "./chatsockets";
import Redis from "ioredis";
import { wsByUserId } from "../redis/subscribers";

export function handleMessage(
  connection: WebSocket,
  user: User,
  message: string | Buffer,
  redisPublisher: Redis
) {
  let payload: any;
  try {
    payload =
      typeof message === "string"
        ? JSON.parse(message)
        : JSON.parse(message.toString());
  } catch {
    connection.send(JSON.stringify({ error: "Invalid message format" }));
    return;
  }

  if (payload.type === "private_msg" && payload.to && payload.text) {
    const msg = JSON.stringify({
      type: "private_msg",
      from: { id: user.id, username: user.username },
      text: payload.text,
      timestamp: Date.now(),
    });
    redisPublisher.publish(`user:${payload.to}`, msg);
  } else if (payload.type === "general_msg" && payload.text) {
    const msg = JSON.stringify({
      type: "general_msg",
      user: { id: user.id, username: user.username },
      text: payload.text,
      timestamp: Date.now(),
    });
    redisPublisher.publish("chat:general", msg);
  } else {
    connection.send(JSON.stringify({ error: "Invalid message payload" }));
  }
}
