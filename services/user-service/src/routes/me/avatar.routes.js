import { updateUserAvatar, getUserById } from "../../services/user.service.js";
import path from "path";
import fs from "fs";
import { pipeline } from "stream/promises";

/**
 * Current user avatar routes (/users/me/avatar)
 * Handles avatar upload and retrieval for authenticated user
 */
export default async function avatarRoute(app) {
    /**
     * POST /users/me/avatar
     * Upload avatar for current authenticated user
     *
     * @requires authentication (cookie)
     * @contentType multipart/form-data
     * @param {File} file - Image file (max 5MB)
     * @returns {Object} Object with avatar filename
     * @statuscode 200 - Avatar uploaded successfully
     * @statuscode 400 - No file uploaded or invalid file
     * @statuscode 413 - File exceeds 5MB limit
     */
    app.post('/', { preHandler: app.authenticate }, async (req, reply) => {
        const data = await req.file();

        if (!data) {
            return reply.code(400).send({ error: 'No file uploaded' });
        }

        const ext = path.extname(data.filename);
        const filename = `user-${req.user.id}${ext}`;
        const filepath = path.join('uploads/avatars', filename);

        // Ensure uploads directory exists
        const uploadDir = path.dirname(filepath);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        await pipeline(data.file, fs.createWriteStream(filepath));

        const avatar = await updateUserAvatar(app, req.user.id, filename);
        return reply.send({ avatar });
    });

    /**
     * GET /users/me/avatar
     * Get current authenticated user's avatar
     *
     * @requires authentication (cookie)
     * @returns {Stream} Avatar image file stream
     * @statuscode 200 - Avatar found and streamed
     * @statuscode 404 - User has no avatar or avatar file not found
     */
    app.get('/', { preHandler: app.authenticate }, async (req, reply) => {
        try {
            const user = await getUserById(app, req.user.id);

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

