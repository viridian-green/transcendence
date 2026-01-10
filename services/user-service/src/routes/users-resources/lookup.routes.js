import { getUserById, getUserByUsername } from "../../services/user.service.js";

/**
 * User lookup routes
 * Handles retrieving public user information by ID or username
 * Note: Username route must be registered before ID route to avoid route conflicts
 */
export default async function lookupRoutes(app) {
    /**
     * GET /users/username/:username
     * Get user by username (public profile)
     *
     * @param {string} username - Username (path parameter)
     * @returns {Object} User object with id, username, email, avatar
     * @statuscode 200 - User found
     * @statuscode 400 - Invalid username format
     * @statuscode 404 - User not found
     */
    app.get('/username/:username', async (req, reply) => {
        const { username } = req.params;

        if (!username || username.trim().length === 0) {
            return reply.code(400).send({ error: 'Invalid username' });
        }

        try {
            const user = await getUserByUsername(app, username.trim());
            return reply.send(user);
        } catch (err) {
            if (err.statusCode === 404) {
                return reply.code(404).send({ error: 'User not found' });
            }
            throw err;
        }
    });

    /**
     * GET /users/:id
     * Get user by ID (public profile)
     *
     * @param {string} id - User ID (path parameter)
     * @returns {Object} User object with id, username, email, avatar
     * @statuscode 200 - User found
     * @statuscode 400 - Invalid user ID format
     * @statuscode 404 - User not found
     */
    app.get('/:id', async (req, reply) => {
        const { id } = req.params;
        const userId = Number(id);

        if (isNaN(userId)) {
            return reply.code(400).send({ error: 'Invalid user ID' });
        }

        try {
            const user = await getUserById(app, userId);
            return reply.send(user);
        } catch (err) {
            if (err.statusCode === 404) {
                return reply.code(404).send({ error: 'User not found' });
            }
            throw err;
        }
    });
}

