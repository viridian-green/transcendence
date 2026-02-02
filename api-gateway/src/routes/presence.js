import fp from "fastify-plugin";
import httpProxy from "@fastify/http-proxy";

async function presenceRoutes(fastify) {
  const sslEnabled = process.env.SSL_ENABLED !== 'false';
  const protocol = sslEnabled ? 'https' : 'http';

  fastify.register(httpProxy, {
    upstream: `${protocol}://presence:3005`,
    prefix: "/api/presence",
    rewritePrefix: "",
    rewriteRequestHeaders: (originalReq, headers) => {
      if (originalReq.headers.cookie) {
        headers.cookie = originalReq.headers.cookie;
      }
      return headers;
    },
    websocket: true,
  });
}

export default fp(presenceRoutes);


