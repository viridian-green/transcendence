import { FastifyInstance } from "fastify";
import chatsocketsHandler from "../handlers/chatsockets.js";

export default async function registerChatsocketsRoute(
  fastify: FastifyInstance
) {
  fastify.get("/websocket", { websocket: true }, chatsocketsHandler);
}
