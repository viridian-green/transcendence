
import fastifyPostgres from '@fastify/postgres';

import Fastify from "fastify";
import websocket from "@fastify/websocket";
import gameWebsocket from './websocket/websocket.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SSL configuration - HTTPS is mandatory
const certPath = path.join(__dirname, '../ssl/game-service.crt');
const keyPath = path.join(__dirname, '../ssl/game-service.key');

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

console.log('SSL enabled for Game Service - HTTPS is mandatory');

const app = Fastify({
    logger: true,
    https: httpsOptions,
});

// const fastifyPostgres = require("@fastify/postgres");
// const path = require("path");

app.register(websocket);
app.register(gameWebsocket);

export default app;
