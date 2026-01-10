import authRoutes from './auth.routes.js';

/**
 * Authentication routes
 * Registered with prefix: /auth
 *
 * Routes:
 * - POST /auth/register - Register a new user
 * - POST /auth/login - Authenticate user and issue JWT
 * - POST /auth/signout - Clear authentication cookie
 */
export default async function authRoutesRegistry(app) {
    app.register(authRoutes);
}

