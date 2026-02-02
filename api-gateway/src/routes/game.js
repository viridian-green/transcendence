import fp from "fastify-plugin";
import httpProxy from "@fastify/http-proxy";
import Fastify from "fastify";

async function gameRoutes(fastify, options) {
  const sslEnabled = process.env.SSL_ENABLED !== 'false';
  const protocol = sslEnabled ? 'https' : 'http';
  const wsProtocol = sslEnabled ? 'wss' : 'ws';

  fastify.register(httpProxy, {
    upstream: `${protocol}://game:3002`,
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
