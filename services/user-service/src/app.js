import Fastify from 'fastify';
import dotenv from 'dotenv';

import plugins from './plugins/index.js';
import routes from './routes/index.js';

dotenv.config();

const app = Fastify({
    logger: true,
    pluginTimeout: 30000 // 30 seconds - allows time for database connection retries
});

app.register(plugins);
app.register(routes);

await app.ready();
console.log(app.printRoutes());

export default app;