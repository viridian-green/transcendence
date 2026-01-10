import { parseUpdateUserBody, updateUser, getUserById } from "../../services/user.service.js";

/**
 * Current user routes (/users/me)
 * Handles authenticated user profile management
 */
export default async function updateUserRoute(app) {
    /**
     * PUT /users/me
     * Update current authenticated user profile
     *
     * @requires authentication (cookie)
     * @param {Object} body - Update data (username, password, email)
     * @returns {Object} Updated user object
     * @statuscode 200 - User updated successfully
     * @statuscode 400 - Validation error
     * @statuscode 404 - User not found
     */
    app.put('/', { preHandler: app.authenticate }, async (req, reply) => {
        const userId = req.user.id;

        const updateData = parseUpdateUserBody(req);
        const updatedUser = await updateUser(app, userId, updateData);

        return reply.send(updatedUser);
    });

    /**
     * GET /users/me
     * Get current authenticated user profile
     *
     * @requires authentication (cookie)
     * @returns {Object} User object with id, username, email, avatar
     * @statuscode 200 - User found
     * @statuscode 404 - User not found
     */
    app.get('/', { preHandler: app.authenticate }, async (request, reply) => {
        const userId = request.user.id;
        const user = await getUserById(app, userId);
        return reply.send(user);
    });
}

