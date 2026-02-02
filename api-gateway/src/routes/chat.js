import fp from "fastify-plugin";
import httpProxy from "@fastify/http-proxy";

async function chatRoutes(fastify) {
  const sslEnabled = process.env.SSL_ENABLED !== 'false';
  const protocol = sslEnabled ? 'https' : 'http';

  fastify.register(httpProxy, {
    upstream: `${protocol}://chat:3004`,
    prefix: "/api/chat",
    rewritePrefix: "", // strip /api/chat so upstream sees /websocket
    rewriteRequestHeaders: (originalReq, headers) => {
      if (originalReq.headers.cookie) {
        headers.cookie = originalReq.headers.cookie;
      }
      return headers;
    },
    websocket: true,
  });
}

export default fp(chatRoutes);
