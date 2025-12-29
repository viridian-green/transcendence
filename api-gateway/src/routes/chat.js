const fp = require("fastify-plugin");

async function chatRoutes(fastify) {
  fastify.register(require("@fastify/http-proxy"), {
    upstream: "http://chat:3004",
    prefix: "/api/chat",
    websocket: true
  });
}

module.exports = fp(chatRoutes);
