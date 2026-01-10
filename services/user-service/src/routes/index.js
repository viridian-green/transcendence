import healthRoute from './health.routes.js';
import authRoutes from './auth/index.js';
import userRoutes from './users-resources/index.js';
import meRoutes from './me/index.js';
import friendsRoutes from './friends/index.js';

/**
 * Main routes registration
 *
 * Route prefixes:
 * - /health - Health check endpoint
 * - /auth - Authentication routes (register, login, signout)
 * - /users - Public user resources (username/:username, /:id, /:id/avatar)
 * - /users/me - Current authenticated user routes (profile, avatar)
 * - /users/friends - Friends management routes
 */
export default async function routes(app) {
    app.register(healthRoute);

    app.register(authRoutes, { prefix: '/auth' });

    app.register(userRoutes, { prefix: '/users'});
    app.register(meRoutes, { prefix: '/users/me'});
    app.register(friendsRoutes, { prefix: '/users/friends'});
}
