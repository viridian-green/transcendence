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

// SSL configuration - HTTPS is mandatory
const certPath = path.join(__dirname, '../ssl/user-service.crt');
const keyPath = path.join(__dirname, '../ssl/user-service.key');

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

console.log('SSL enabled for User Service - HTTPS is mandatory');

const app = Fastify({
    logger: true,
    pluginTimeout: 30000, // 30 seconds - allows time for database connection retries
    https: httpsOptions,
});

app.register(plugins);
app.register(routes);

export default app;