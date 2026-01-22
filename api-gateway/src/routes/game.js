import fp from "fastify-plugin";
import httpProxy from "@fastify/http-proxy";
import Fastify from "fastify";

async function gameRoutes(fastify, options) {
  fastify.register(httpProxy, {
    upstream: 'http://game:3002',
    prefix: "api/game",
    websocket: true,
    rewritePrefix: "",
    rewriteRequestHeaders: (originalReq, headers) => {
    if (originalReq.headers.cookie) {
    headers.cookie = originalReq.headers.cookie;
    }
    return headers;
    },
  });
}

export default fp(gameRoutes);
