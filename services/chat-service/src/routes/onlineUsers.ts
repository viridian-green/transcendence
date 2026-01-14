import { FastifyInstance } from "fastify";
import { getOnlineUsers } from "../utils/onlineUsers.js";

export default async function registerOnlineUsersRoute(fastify: FastifyInstance) {
  fastify.get("/online-users", async (request, reply) => {
    const users = await getOnlineUsers();
    reply.send({ users });
  });
}