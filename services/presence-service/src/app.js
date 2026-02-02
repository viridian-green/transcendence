import Fastify from "fastify";
import dotenv from "dotenv";
import websocket from "@fastify/websocket";
import stateRoutes from "./routes/state.routes.js";
import presenceRoutes from "./routes/presence.routes.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SSL configuration
const sslEnabled = process.env.SSL_ENABLED !== 'false'; // Default to true
let httpsOptions = null;

if (sslEnabled) {
    const certPath = path.join(__dirname, '../ssl/presence-service.crt');
    const keyPath = path.join(__dirname, '../ssl/presence-service.key');

    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
        httpsOptions = {
            cert: fs.readFileSync(certPath),
            key: fs.readFileSync(keyPath),
        };
        console.log('SSL enabled for Presence Service');
    } else {
        console.warn('SSL certificates not found, falling back to HTTP');
    }
}

const app = Fastify({
  logger: true,
  https: httpsOptions || undefined,
});

// Register WebSocket plugin
await app.register(websocket);

// Register routes
await app.register(presenceRoutes);
await app.register(stateRoutes, { prefix: "/" });
await app.ready();
console.log(app.printRoutes());

export default app;


