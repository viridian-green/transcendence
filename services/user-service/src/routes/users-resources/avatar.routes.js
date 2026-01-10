import { getUserById } from "../../services/user.service.js";
import path from "path";
import fs from "fs";

/**
 * Public avatar routes
 * Handles retrieving user avatars by user ID (public access)
 */
export default async function avatarRoutes(app) {
    /**
     * GET /users/:id/avatar
     * Get user avatar by user ID (public access)
     *
     * @param {string} id - User ID (path parameter)
     * @returns {Stream} Avatar image file stream
     * @statuscode 200 - Avatar found and streamed
     * @statuscode 400 - Invalid user ID format
     * @statuscode 404 - User not found, user has no avatar, or avatar file not found
     */
    app.get('/:id/avatar', async (req, reply) => {
        const { id } = req.params;
        const userId = Number(id);

        if (isNaN(userId)) {
            return reply.code(400).send({ error: 'Invalid user ID' });
        }

        try {
            const user = await getUserById(app, userId);

            if (!user.avatar) {
                return reply.code(404).send({ error: 'Avatar not found' });
            }

            const filepath = path.join('uploads/avatars', user.avatar);

            if (!fs.existsSync(filepath)) {
                return reply.code(404).send({ error: 'Avatar file not found' });
            }

            return reply.type(path.extname(user.avatar)).send(fs.createReadStream(filepath));
        } catch (err) {
            if (err.statusCode === 404) {
                return reply.code(404).send({ error: 'User not found' });
            }
            throw err;
        }
    });
}