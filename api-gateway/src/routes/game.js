import fp from "fastify-plugin";
import httpProxy from "@fastify/http-proxy";

async function gameRoutes(fastify, options) {
  fastify.register(httpProxy, {
    upstream: "http://game:3002",
    prefix: "/game",
    websocket: true,
    rewritePrefix: "/",
  });
}

export default fp(gameRoutes);
