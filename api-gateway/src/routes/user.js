import fp from "fastify-plugin";
import httpProxy from "@fastify/http-proxy";

async function userRoutes(fastify) {
  fastify.register(httpProxy, {
    upstream: `https://user:3003`,
    prefix: "/api/auth",
    rewritePrefix: "/auth",
    replyOptions: {
      rewriteRequestHeaders: (originalReq, headers) => {
        if (originalReq.headers.cookie) {
          headers.cookie = originalReq.headers.cookie;
        }
        return headers;
      },
    },
    // methods: ["GET", "POST", etc], //use this in production, safer
  });

  fastify.register(httpProxy, {
    upstream: `https://user:3003`,
    prefix: "/api/users",
    rewritePrefix: "/users",
    replyOptions: {
      rewriteRequestHeaders: (originalReq, headers) => {
        if (originalReq.user?.id) {
          headers["x-user-id"] = String(originalReq.user.id);
        }
        if (originalReq.user?.username) {
          headers["x-username"] = originalReq.user.username;
        }
        if (originalReq.headers.cookie) {
          headers.cookie = originalReq.headers.cookie;
        }
        return headers;
      },
    },
  });

    fastify.register(httpProxy, {
        upstream: `https://user:3003`,
        prefix: "/api/avatars",
        rewritePrefix: "/avatars",
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

export default fp(userRoutes);
