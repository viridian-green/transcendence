import Fastify from "fastify";

//import gameRoutes from "./routes/game.js";
import userRoutes from "./routes/user.js";

const fastify = Fastify({ logger: true });

const start = async () => {
    try {
        // await fastify.register(authPlugin);

        //await fastify.register(gameRoutes); // Temporarily disabled until game routes are fully migrated to ESM
        await fastify.register(userRoutes);

        await fastify.listen({ port: 3000, host: "0.0.0.0" });
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
};

start();
