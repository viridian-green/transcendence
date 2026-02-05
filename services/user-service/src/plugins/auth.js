import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import fp from 'fastify-plugin';
import fs from 'fs';
import { authenticate, optionalAuth } from '../services/auth.service.js';

function resolveJwtSecret() {
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

function resolveCookieSecret() {
    if (process.env.COOKIE_SECRET) {
        return process.env.COOKIE_SECRET;
    }
    const cookieSecretFile = process.env.COOKIE_SECRET_FILE;
    if (cookieSecretFile) {
        try {
            return fs.readFileSync(cookieSecretFile, 'utf8').trim();
        } catch (err) {
            throw new Error(`Failed to read cookie secret file at ${cookieSecretFile}: ${err.message}`);
        }
    }
    throw new Error('Cookie secret is not configured. Set COOKIE_SECRET or COOKIE_SECRET_FILE.');
}

/**
 * Authentication plugin for User Service
 * Sets up cookie and JWT for token signing, and authenticate decorator
 */
async function authPlugin(app) {
    // Register cookie plugin
    const cookieSecret = resolveCookieSecret();
    app.register(cookie, {
        secret: cookieSecret,
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

    app.decorate("optionalAuth", optionalAuth);
}

export default fp(authPlugin);
