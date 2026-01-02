import dotenv from "dotenv";
dotenv.config();

import Fastify from "fastify";
import cookie from "@fastify/cookie";

//import gameRoutes from "./routes/game.js";
import authPlugin from "./plugins/auth.js";
import userRoutes from "./routes/user.js";
import chatRoutes from "./routes/chat.js";
import healthRoute from "./health.js";

const fastify = Fastify({ logger: true });

const start = async () => {
    try {
        await fastify.register(cookie);
        await fastify.register(authPlugin);
        //await fastify.register(gameRoutes); // Temporarily disabled until game routes are fully migrated to ESM
        await fastify.register(userRoutes);
        await fastify.register(chatRoutes);
        await fastify.register(healthRoute);

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
