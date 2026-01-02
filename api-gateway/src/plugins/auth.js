import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { authHook } from '../services/auth.service.js';

/**
 * Authentication plugin for API Gateway
 * Sets up JWT verification and authentication middleware
 */
async function authPlugin(fastify) {
    // Validate JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is required');
    }

    // Register JWT plugin
    await fastify.register(jwt, {
        secret: process.env.JWT_SECRET,
        cookie: {
            cookieName: 'access_token',
            signed: false
        }
    });

    // Register authentication hook
    fastify.addHook("onRequest", authHook);
}

export default fp(authPlugin);