import { FastifyInstance } from "fastify";
import notificationsHandler from "../handlers/notifications.js";

export default async function registerNotificationsRoute(
  fastify: FastifyInstance
) {
  fastify.get("/websocket", { websocket: true }, notificationsHandler);
}

