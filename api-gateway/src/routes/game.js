import fp from "fastify-plugin";
import httpProxy from "@fastify/http-proxy";
import Fastify from "fastify";

async function gameRoutes(fastify, options) {
  fastify.register(httpProxy, {
    upstream: 'http://game:3002',
    prefix: '/game',
    websocket: true,
    rewritePrefix: '/ws', // external /game → game service /ws
  });
}

export default fp(gameRoutes);
