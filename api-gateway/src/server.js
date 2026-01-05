import dotenv from "dotenv";
dotenv.config();

import Fastify from "fastify";
import cookie from "@fastify/cookie";

// import gameRoutes from "./routes/game.js";
import authPlugin from "./plugins/auth.js";
import userRoutes from "./routes/user.js";
import healthRoute from "./health.js";
// import websocket from "@fastify/websocket";
import proxy from "@fastify/http-proxy";


const fastify = Fastify({ logger: true });

const start = async () => {
    try {
        // await fastify.register(cookie);
        // await fastify.register(authPlugin);
        // await fastify.register(userRoutes);
        await fastify.register(healthRoute);
        // await fastify.register(websocket);
            
        fastify.register(proxy, {
        upstream: "http://game:3002",
        prefix: "/game",
        rewritePrefix: "/game",
        websocket: true,
        });

        //DEBUGGING - This is needed to print the routes
        await fastify.ready();
        console.log(fastify.printRoutes());

        await fastify.listen({ port: 3000, host: "0.0.0.0" });
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
};

start();
