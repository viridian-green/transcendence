import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import fp from 'fastify-plugin';
import fs from 'fs';
import { authenticate } from '../services/auth.service.js';

function resolveJwtSecret() {
    if (process.env.JWT_SECRET) {
        return process.env.JWT_SECRET;
    }
    const jwtSecretFile = process.env.JWT_SECRET_FILE;
    if (jwtSecretFile) {
        try {
            return fs.readFileSync(jwtSecretFile, 'utf8').trim();
        } catch (err) {
            throw new Error(`Failed to read JWT secret file at ${jwtSecretFile}: ${err.message}`);
        }
    }
    throw new Error('JWT secret is not configured. Set JWT_SECRET or JWT_SECRET_FILE.');
}

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
    const jwtSecret = resolveJwtSecret();
    app.register(jwt, {
        secret: jwtSecret,
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