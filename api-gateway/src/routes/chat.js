import fp from "fastify-plugin";
import httpProxy from "@fastify/http-proxy";

async function chatRoutes(fastify) {
  fastify.register(httpProxy, {
    upstream: "http://chat:3004",
    prefix: "/api/chat",
    rewritePrefix: "", // strip /api/chat so upstream sees /websocket
    websocket: true,
    rewriteRequestHeaders: (originalReq, headers) => {
      try {
        // Parse cookies manually from Cookie header
        const cookieHeader = originalReq.headers.cookie || "";

        // Extract access_token from cookie string
        const match = cookieHeader.match(/access_token=([^;]+)/);
        const token = match ? match[1] : null;

        if (token) {
          try {
            const decoded = fastify.jwt.verify(token);

            headers["x-user-id"] = decoded.id.toString();
            headers["x-username"] = decoded.username;
          } catch (jwtErr) {
            fastify.log.error("JWT verification failed:", jwtErr.message);
          }
        }
      } catch (err) {
        fastify.log.error("Error in rewriteRequestHeaders:", err.message);
      }
      return headers;
    },
  });
}

export default fp(chatRoutes);
