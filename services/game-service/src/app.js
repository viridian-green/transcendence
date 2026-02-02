
import fastifyPostgres from '@fastify/postgres';

import Fastify from "fastify";
import websocket from "@fastify/websocket";
import gameWebsocket from './websocket/websocket.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SSL configuration
const sslEnabled = process.env.SSL_ENABLED !== 'false'; // Default to true
let httpsOptions = null;

if (sslEnabled) {
    const certPath = path.join(__dirname, '../ssl/game-service.crt');
    const keyPath = path.join(__dirname, '../ssl/game-service.key');

    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
        httpsOptions = {
            cert: fs.readFileSync(certPath),
            key: fs.readFileSync(keyPath),
        };
        console.log('SSL enabled for Game Service');
    } else {
        console.warn('SSL certificates not found, falling back to HTTP');
    }
}

const app = Fastify({
    logger: true,
    https: httpsOptions || undefined,
});

// const fastifyPostgres = require("@fastify/postgres");
// const path = require("path");

app.register(websocket);
app.register(gameWebsocket);

export default app;
