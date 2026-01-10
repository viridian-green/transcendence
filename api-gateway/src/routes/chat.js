import fp from "fastify-plugin";
import httpProxy from "@fastify/http-proxy";

async function chatRoutes(fastify) {
  fastify.register(httpProxy, {
    upstream: "http://chat:3004",
    prefix: "/api/chat",
    rewritePrefix: "", // strip /api/chat so upstream sees /websocket
    websocket: true,
    rewriteRequestHeaders: (originalReq, headers) => {
      // Forward user info from gateway auth to chat-service
      // originalReq.user is set by the auth plugin after JWT verification
      if (originalReq.user?.id) {
        headers["x-user-id"] = String(originalReq.user.id);
      }
      if (originalReq.user?.username) {
        headers["x-username"] = originalReq.user.username;
      }
      return headers;
    },
  });
}

export default fp(chatRoutes);
