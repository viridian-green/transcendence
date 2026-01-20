import fp from "fastify-plugin";
import httpProxy from "@fastify/http-proxy";

async function presenceRoutes(fastify) {
  fastify.register(httpProxy, {
    upstream: "http://presence:3005",
    prefix: "/api/presence",
    rewritePrefix: "/",
    replyOptions: {
      rewriteRequestHeaders: (originalReq, headers) => {
        if (originalReq.headers.cookie) {
          headers.cookie = originalReq.headers.cookie;
        }
        return headers;
      },
    },
  });
}

export default fp(presenceRoutes);


