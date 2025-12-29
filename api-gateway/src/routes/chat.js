import fp from "fastify-plugin";
import httpProxy from "@fastify/http-proxy";

async function chatRoutes(fastify) {
  fastify.register(httpProxy, {
    upstream: "http://chat:3004",
    prefix: "/api/chat",
    websocket: true,
  });
}

export default fp(chatRoutes);
