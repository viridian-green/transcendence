import fp from "fastify-plugin";
import httpProxy from "@fastify/http-proxy";

async function userRoutes(fastify) {
  fastify.register(httpProxy, {
    upstream: "http://user:3003",
    prefix: "/api/auth",
    rewritePrefix: "/auth",
    rewriteRequestHeaders: (originalReq, headers) => {
      // Forward cookies for authentication
      if (originalReq.headers.cookie) {
        headers.cookie = originalReq.headers.cookie;
      }
      return headers;
    },
    // methods: ["GET", "POST", etc], //use this in production, safer
  });

    fastify.register(httpProxy, {
        upstream: "http://user:3003",
        prefix: "/api/users",
        rewritePrefix: "/users",
        // methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
        rewriteRequestHeaders: (originalReq, headers) => {
            // Forward user info from gateway auth to user-service
            // originalReq.user is set by the auth plugin after JWT verification
            if (originalReq.user?.id) {
                headers['x-user-id'] = String(originalReq.user.id);
            }
            if (originalReq.user?.username) {
                headers['x-username'] = originalReq.user.username;
            }
            return headers;
        }
    });
}

export default fp(userRoutes);
