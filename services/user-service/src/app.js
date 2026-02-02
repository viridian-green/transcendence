import Fastify from 'fastify';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import plugins from './plugins/index.js';
import routes from './routes/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SSL configuration
const sslEnabled = process.env.SSL_ENABLED !== 'false'; // Default to true
let httpsOptions = null;

if (sslEnabled) {
    const certPath = path.join(__dirname, '../ssl/user-service.crt');
    const keyPath = path.join(__dirname, '../ssl/user-service.key');

    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
        httpsOptions = {
            cert: fs.readFileSync(certPath),
            key: fs.readFileSync(keyPath),
        };
        console.log('SSL enabled for User Service');
    } else {
        console.warn('SSL certificates not found, falling back to HTTP');
    }
}

const app = Fastify({
    logger: true,
    pluginTimeout: 30000, // 30 seconds - allows time for database connection retries
    https: httpsOptions || undefined,
});

app.register(plugins);
app.register(routes);

await app.ready();
console.log(app.printRoutes());

export default app;