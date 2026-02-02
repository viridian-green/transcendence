import dotenv from "dotenv";
dotenv.config();

import Fastify from "fastify";
import cookie from "@fastify/cookie";
import fastifyStatic from '@fastify/static';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import https from 'https';
import http from 'http';

import gameRoutes from "./routes/game.js";
import authPlugin from "./plugins/auth.js";
import userRoutes from "./routes/user.js";
import chatRoutes from "./routes/chat.js";
import presenceRoutes from "./routes/presence.js";
import notificationRoutes from "./routes/notification.js";
import healthRoute from "./health.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SSL configuration
const sslEnabled = process.env.SSL_ENABLED !== 'false'; // Default to true
let httpsOptions = null;

if (sslEnabled) {
    const certPath = path.join(__dirname, '../ssl/api-gateway.crt');
    const keyPath = path.join(__dirname, '../ssl/api-gateway.key');

    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
        httpsOptions = {
            cert: fs.readFileSync(certPath),
            key: fs.readFileSync(keyPath),
        };
        console.log('SSL enabled for API Gateway');
    } else {
        console.warn('SSL certificates not found, falling back to HTTP');
    }
}

const fastify = Fastify({
    logger: true,
    ...(httpsOptions ? { https: httpsOptions } : {})
});

const start = async () => {
    try {
        await fastify.register(cookie);
        await fastify.register(authPlugin);
        await fastify.register(chatRoutes);
        await fastify.register(presenceRoutes);
        await fastify.register(notificationRoutes);
        await fastify.register(healthRoute);
        await fastify.register(gameRoutes);
        await fastify.register(userRoutes);


        //DEBUGGING - This is needed to print the routes
        await fastify.ready();
        console.log(fastify.printRoutes());

        const protocol = httpsOptions ? 'https' : 'http';
        await fastify.listen({
            port: 3000,
            host: "0.0.0.0"
        });
        console.log(`API Gateway running on ${protocol}://0.0.0.0:3000`);
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
};

start();
