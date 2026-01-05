import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import fp from 'fastify-plugin';

async function authPlugin(app) {
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

    // app.after(() => {
    //     console.log(app.jwt);
    //     console.log(app.jwt.options);
    // });

    app.decorate("authenticate", async function (request, reply) {
        await request.jwtVerify();
    });
}

export default fp(authPlugin);