import meRoute from '../me/me.routes.js'
import avatarRoute from './../me/avatar.routes.js';

/**
 * Current user routes
 * Registered with prefix: /users/me
 * All routes require authentication
 *
 * Routes:
 * - GET /users/me - Get current user profile
 * - PUT /users/me - Update current user profile
 * - GET /users/me/avatar - Get current user's avatar
 * - POST /users/me/avatar - Upload current user's avatar
 */
export default async function meRoutes(app) {
    app.register(meRoute);
    app.register(avatarRoute, { prefix: '/avatar' });
}
