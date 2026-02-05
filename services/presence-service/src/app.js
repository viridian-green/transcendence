import Fastify from "fastify";
import dotenv from "dotenv";
import websocket from "@fastify/websocket";
import stateRoutes from "./routes/state.routes.js";
import presenceRoutes from "./routes/presence.routes.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Initialize Redis subscriber for broadcasting presence updates
import "./redisSubscriber.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SSL configuration - HTTPS is mandatory
const certPath = path.join(__dirname, '../ssl/presence-service.crt');
const keyPath = path.join(__dirname, '../ssl/presence-service.key');

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


const app = Fastify({
  logger: true,
  https: httpsOptions,
});

// Register WebSocket plugin
await app.register(websocket);

// Register routes
await app.register(presenceRoutes);
await app.register(stateRoutes, { prefix: "/" });

export default app;


