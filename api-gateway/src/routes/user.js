const fp = require("fastify-plugin");

async function userRoutes(fastify) {
  fastify.register(require("@fastify/http-proxy"), {
    upstream: "http://user:3003",
    prefix: "/api/auth",
  });

  fastify.register(require("@fastify/http-proxy"), {
    upstream: "http://user:3003",
    prefix: "/api/users",
  });
}

module.exports = fp(userRoutes);
