import Fastify from 'fastify';
import dotenv from 'dotenv';

dotenv.config();

const app = Fastify({
    logger: true
});

import dbPlugin from './plugins/db.js';
app.register(dbPlugin);

import healthRoute from './routes/health.js';
app.register(healthRoute);

import userRoutes from './routes/users/index.js';
app.register(userRoutes, { prefix: '/users' });

export default app;