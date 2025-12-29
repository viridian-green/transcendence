import fp from "fastify-plugin";
import httpProxy from "@fastify/http-proxy";

async function userRoutes(fastify) {
//   fastify.register(httpProxy, {
//     upstream: "http://user:3003",
//     prefix: "/api/auth",
//   });

    fastify.register(httpProxy, {
        upstream: "http://user:3003",
        prefix: "/api/users",
    });
}

export default fp(userRoutes);
