import dotenv from "dotenv";
dotenv.config();

import Fastify from "fastify";
import cookie from "@fastify/cookie";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

import gameRoutes from "./routes/game.js";
import authPlugin from "./plugins/auth.js";
import userRoutes from "./routes/user.js";
import chatRoutes from "./routes/chat.js";
import presenceRoutes from "./routes/presence.js";
import notificationRoutes from "./routes/notification.js";
import healthRoute from "./health.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const certPath = path.join(__dirname, '../ssl/api-gateway.crt');
const keyPath = path.join(__dirname, '../ssl/api-gateway.key');

if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    console.error('ERROR: SSL certificates are required but not found!');
    console.error(`Certificate path: ${certPath}`);
    console.error(`Key path: ${keyPath}`);
    console.error('Please generate SSL certificates using: ./scripts/generate-ssl-certs.sh');
    process.exit(1);
}

const httpsOptions = {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath),
};

const fastify = Fastify({
    logger: true,
    https: httpsOptions
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


        await fastify.ready();

        await fastify.listen({
            port: 3000,
            host: "0.0.0.0"
        });
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
};

start();
