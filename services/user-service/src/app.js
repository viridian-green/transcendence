import Fastify from 'fastify';
import dotenv from 'dotenv';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';

dotenv.config();

const app = Fastify({
    logger: true
});

app.register(cookie, {
    secret: process.env.COOKIE_SECRET,
    cookie: {
        cookieName: 'access_token',
        signed: false
    }
});

app.register(jwt, {
    secret: process.env.JWT_SECRET,
    cookie: {
        cookieName: 'access_token',
        signed: false
    }
});

// ✅ SAFE
app.after(() => {
    console.log(app.jwt);           // exists
    console.log(app.jwt.options);   // exists
});

app.decorate("authenticate", async function (request, reply) {
    await request.jwtVerify();
});

import dbPlugin from './plugins/db.js';
app.register(dbPlugin);

import healthRoute from './routes/health.js';
app.register(healthRoute);

import userRoutes from './routes/users/index.js';
app.register(userRoutes);
//{ prefix: '/users'

await app.ready();
console.log(app.printRoutes());

export default app;