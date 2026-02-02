import fp from "fastify-plugin";
import httpProxy from "@fastify/http-proxy";

async function notificationRoutes(fastify) {
  const sslEnabled = process.env.SSL_ENABLED !== 'false';
  const protocol = sslEnabled ? 'https' : 'http';

  fastify.register(httpProxy, {
    upstream: `${protocol}://notification:3006`,
    prefix: "/api/notifications",
    rewritePrefix: "", // strip /api/notifications so upstream sees /websocket
    rewriteRequestHeaders: (originalReq, headers) => {
      if (originalReq.headers.cookie) {
        headers.cookie = originalReq.headers.cookie;
      }
      return headers;
    },
    websocket: true,
  });
}

export default fp(notificationRoutes);

