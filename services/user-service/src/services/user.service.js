import { updateUserSchema } from "../schemas/auth.schema.js";
import { hashPassword } from "./auth.service.js";

export function parseUpdateUserBody(req) {
    const result = updateUserSchema.safeParse(req.body);
    if (!result.success) {
        const err = new Error('Validation error');
        err.statusCode = 400;
        err.details = result.error.format();
        throw err;
    }
    return result.data;
}

export async function updateUser(app, userId, updateData) {
    if (updateData.password) {
        updateData.password = await hashPassword(updateData.password);
    }

    if (updateData.bio) {
        updateData.bio = updateData.bio.slice(0, 150);
    }

    const fields = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(updateData)) {
        fields.push(`${key} = $${index++}`);
        values.push(value);
    }

    values.push(userId);

    const query = `
        UPDATE users
        SET ${fields.join(", ")}
        WHERE id = $${index}
        RETURNING id, username, email, bio
    `;

    const { rows } = await app.pg.query(query, values);

    if (rows.length === 0) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    return rows[0];
}

export async function getUserById(app, userId) {
    const { rows } = await app.pg.query(
        `
        SELECT id, username, email, avatar, bio
        FROM users
        WHERE id = $1
        `,
        [userId]
    );

    if (rows.length === 0) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    return rows[0];
}

export async function updateUserAvatar(app, userId, filename) {
    const { rows } = await app.pg.query(
        'UPDATE users SET avatar = $1 WHERE id = $2 RETURNING avatar',
        [filename, userId]
    );

    if (rows.length === 0) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    return rows[0].avatar;
}

