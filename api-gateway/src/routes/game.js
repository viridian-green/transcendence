const fp = require("fastify-plugin");

async function gameRoutes(fastify, options) {
  fastify.register(require("@fastify/http-proxy"), {
    upstream: "http://game:3002",
    prefix: "/api/game",
    rewritePrefix: "/",
  });
}

module.exports = fp(gameRoutes);
