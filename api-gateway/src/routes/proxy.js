const fp = require("fastify-plugin");

async function proxyRoutes(fastify) {
    fastify.register(require("@fastify/http-proxy"), {
        upstream: "http://user-service:4000",
        prefix: "/api/auth"
    });

    fastify.register(require("@fastify/http-proxy"), {
        upstream: "http://user-service:4000",
        prefix: "/api/users"
    });

    fastify.register(require("@fastify/http-proxy"), {
        upstream: "http://game-service:5000",
        prefix: "/api/matches"
    });
}

module.exports = fp(proxyRoutes);
