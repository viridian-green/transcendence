import { parseUpdateUserBody, updateUser, getUserById, updateUserAvatar } from "../../../services/user.service.js";
import path from "path";
import fs from "fs";
import { pipeline } from "stream/promises";

export default async function updateUserRoute(app) {
    app.put('/', { preHandler: app.authenticate }, async (req, reply) => {
        const userId = req.user.id;

        const updateData = parseUpdateUserBody(req);
        const updatedUser = await updateUser(app, userId, updateData);

        return reply.send(updatedUser);
    });

    app.get('/',
        { preHandler: app.authenticate },
        async (request, reply) => {
            const userId = request.user.id;
            const user = await getUserById(app, userId);
            return reply.send(user);
        }
    );

    app.post('/avatar', { preHandler: app.authenticate }, async (req, reply) => {
        try {
            const data = await req.file();

            if (!data) {
                return reply.code(400).send({ error: 'No file uploaded' });
            }

            // validate file type
            const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedMimeTypes.includes(data.mimetype)) {
                return reply.code(400).send({
                    error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'
                });
            }

            // validate file extensions to match the allowed types
            const ext = path.extname(data.filename).toLowerCase();
            const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
            if (!allowedExtensions.includes(ext)) {
                return reply.code(400).send({
                    error: 'Invalid file extension. Only .jpg, .jpeg, .png, .gif, and .webp are allowed.'
                });
            }

            // old avatar cleanup except for the default.png
            const currentUser = await getUserById(app, req.user.id);
            const oldAvatarPath = currentUser.avatar && currentUser.avatar !== 'default.png'
                ? path.join('uploads/avatars', currentUser.avatar)
                : null;

            // Generate new filename with timestamp to ensure uniqueness and force cache refresh
            const timestamp = Date.now();
            const filename = `user-${req.user.id}-${timestamp}${ext}`;
            const filepath = path.join('uploads/avatars', filename);

            // ensure uploads directory exists
            const uploadDir = path.dirname(filepath);
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // sve new avatar file
            await pipeline(data.file, fs.createWriteStream(filepath));

            // update database
            const avatar = await updateUserAvatar(app, req.user.id, filename);

            // Delete old avatar file if it exists and is not the default
            if (oldAvatarPath && fs.existsSync(oldAvatarPath) && oldAvatarPath !== filepath) {
                try {
                    fs.unlinkSync(oldAvatarPath);
                    app.log.info(`Deleted old avatar file: ${oldAvatarPath}`);
                } catch (err) {
                    app.log.warn(`Failed to delete old avatar file: ${oldAvatarPath}`, err);
                }
            }

            // Clean up any other old avatar files for this user (matching pattern user-{id}-*.{ext})
            // This handles cases where old files might not have been deleted
            try {
                const files = fs.readdirSync(uploadDir);
                const userAvatarPattern = new RegExp(`^user-${req.user.id}-\\d+\\.[a-zA-Z]+$`);
                files.forEach((file) => {
                    if (userAvatarPattern.test(file) && file !== filename) {
                        const oldFile = path.join(uploadDir, file);
                        try {
                            fs.unlinkSync(oldFile);
                            app.log.info(`Deleted old avatar file: ${oldFile}`);
                        } catch (err) {
                            app.log.warn(`Failed to delete old avatar file: ${oldFile}`, err);
                        }
                    }
                });
            } catch (err) {
                app.log.warn('Failed to clean up old avatar files', err);
            }

            return reply.code(200).send({ avatar });
        } catch (err) {
            app.log.error('Avatar upload error:', err);
            if (err.statusCode) {
                return reply.code(err.statusCode).send({ error: err.message });
            }
            return reply.code(500).send({ error: 'Failed to upload avatar' });
        }
    });
}


