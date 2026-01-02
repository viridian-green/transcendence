import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import fp from 'fastify-plugin';
import { authenticate } from '../services/auth.service.js';

/**
 * Authentication plugin for User Service
 * Sets up cookie and JWT for token signing, and authenticate decorator
 */
async function authPlugin(app) {
    // Register cookie plugin
    app.register(cookie, {
        secret: process.env.COOKIE_SECRET,
        cookie: {
            cookieName: 'access_token',
            signed: false
        }
    });

    // Register JWT plugin for signing tokens (used in login/register)
    app.register(jwt, {
        secret: process.env.JWT_SECRET,
        cookie: {
            cookieName: 'access_token',
            signed: false
        }
    });

    // Decorate app with authenticate middleware
    // This reads user info from headers set by API Gateway
    app.decorate("authenticate", authenticate);
}

export default fp(authPlugin);