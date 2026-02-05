import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import fs from 'fs';
import { authHook } from '../services/auth.service.js';

// Resolve JWT secret either from env var or from a mounted secret file
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
 * Authentication plugin for API Gateway
 * Sets up JWT verification and authentication middleware
 */
async function authPlugin(fastify) {
    const jwtSecret = resolveJwtSecret();

    // Register JWT plugin
    await fastify.register(jwt, {
        secret: jwtSecret,
        cookie: {
            cookieName: 'access_token',
            signed: false
        }
    });

    // Register authentication hook
    fastify.addHook("onRequest", authHook);
}

export default fp(authPlugin);