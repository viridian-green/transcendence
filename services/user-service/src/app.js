import Fastify from 'fastify';
import dotenv from 'dotenv';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';

dotenv.config();

const app = Fastify({
    logger: true
});

app.register(jwt, {
    secret: process.env.JWT_SECRET
});

app.register(cookie, {
    secret: process.env.COOKIE_SECRET,
});

app.decorate("authenticate", async function (request, reply) {
    try {
        await request.jwtVerify();
    } catch (err) {
        reply.code(401).send({ error: "Unauthorized" });
    }
});

import dbPlugin from './plugins/db.js';
app.register(dbPlugin);

import healthRoute from './routes/health.js';
app.register(healthRoute);

import userRoutes from './routes/users/index.js';
app.register(userRoutes);
//{ prefix: '/users'

export default app;