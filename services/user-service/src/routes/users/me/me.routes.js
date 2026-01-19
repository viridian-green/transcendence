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

    app.post('/me/avatar', { preHandler: app.authenticate }, async (req, reply) => {
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
}


