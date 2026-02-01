import Fastify from 'fastify';
import dotenv from 'dotenv';
import seed from './seed.js';

import plugins from './plugins/index.js';
import routes from './routes/index.js';

dotenv.config();

const app = Fastify({
    logger: true
});

app.register(plugins);
app.register(routes);

await app.ready();
await seed();
console.log(app.printRoutes());

export default app;