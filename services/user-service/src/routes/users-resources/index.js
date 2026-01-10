import lookupRoutes from "./lookup.routes.js";
import avatarRoutes from "./avatar.routes.js";

/**
 * Public user resources routes
 * Registered with prefix: /users
 *
 * Routes:
 * - GET /users/username/:username - Get user by username
 * - GET /users/:id - Get user by ID
 * - GET /users/:id/avatar - Get user avatar by ID
 */
export default async function userRoutes(app) {
    app.register(lookupRoutes);
    app.register(avatarRoutes);
}