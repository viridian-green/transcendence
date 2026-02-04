export async function ensureUserExists(app, userId) {
    const { rowCount } = await app.pg.query(
        'SELECT 1 FROM users WHERE id = $1',
        [userId]
    );

    if (rowCount === 0) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }
}

export async function ensureNoExistingFriendship(app, userId, friendId) {
    const { rowCount } = await app.pg.query(
        `
        SELECT * FROM friends
        WHERE (user_one = $1 AND user_two = $2)
        OR (user_one = $2 AND user_two = $1)
        `,
        [userId, friendId]
    );
    if (rowCount > 0) {
        const err = new Error('Friendship already exists or pending');
        err.statusCode = 409;
        throw err;
    }
}

export function ensureNotSelf(userId, friendId) {
    if (userId === friendId) {
        const err = new Error('Friend id must be different than user id');
        err.statusCode = 400;
        throw err;
    }
}

export async function acceptFriendRequest(app, userId, friendId) {
    const { rows, rowCount } = await app.pg.query(
        `
        UPDATE friends
        SET status = 'accepted'
        WHERE ((user_one = $1 AND user_two = $2)
            OR (user_one = $2 AND user_two = $1))
        AND status = 'pending'
        AND (requested_by IS NULL OR requested_by = $2)
        RETURNING *
        `, [userId, friendId]
    );
    if (rowCount === 0) {
        const err = new Error("Can't find friendship request");
        err.statusCode = 404;
        throw err;
    }
    return rows[0];
}

export async function createFriendRequest(app, userId, friendId) {
    const userOne = Math.min(userId, friendId);
    const userTwo = Math.max(userId, friendId);
    const { rows } = await app.pg.query(`INSERT INTO friends (user_one, user_two, requested_by)
            VALUES ($1, $2, $3)
            RETURNING *`,
        [userOne, userTwo, userId]
    );
    return rows[0];
}

export async function rejectFriendRequest(app, userId, friendId) {
    const { rows, rowCount } = await app.pg.query(
        `
        DELETE FROM friends
        WHERE ((user_one = $1 AND user_two = $2)
            OR (user_one = $2 AND user_two = $1))
        AND status = 'pending'
        AND (requested_by IS NULL OR requested_by = $2)
        RETURNING *
        `,
        [userId, friendId]
    );
    if (rowCount === 0) {
        const err = new Error("Can't find friendship request");
        err.statusCode = 404;
        throw err;
    }
    return rows;
}

export async function deleteFriendship(app, userId, friendId) {
    const { rows, rowCount } = await app.pg.query(
        `
        DELETE FROM friends
        WHERE (user_one = $1 AND user_two = $2)
        OR (user_one = $2 AND user_two = $1)
        RETURNING *`,
        [userId, friendId]
    );
    if (rowCount === 0) {
        const err = new Error("Can't find friendship");
        err.statusCode = 404;
        throw err;
    }
    return rows;
}

export async function getFriendsList(app, userId) {
    const { rows } = await app.pg.query(
        `
        SELECT u.id, u.email, u.username, u.avatar, u.bio FROM friends f
        JOIN users u ON (u.id = f.user_two AND f.user_one = $1)
                     OR (u.id = f.user_one AND f.user_two = $1)
        WHERE (f.user_one = $1 OR f.user_two = $1)
        AND f.status = 'accepted'
        `, [userId]
    );

    const map = new Map();
    for (const row of rows) {
        map.set(row.id, row);
    }

    return map;
}

export async function getPendingFriendRequests(app, userId) {
    const { rows } = await app.pg.query(
        `
        SELECT
            f.requested_by,
            f.user_one,
            f.user_two,
            u.id,
            u.username,
            u.avatar,
            u.bio
        FROM friends f
        JOIN users u ON u.id = CASE WHEN f.user_one = $1 THEN f.user_two ELSE f.user_one END
        WHERE (f.user_one = $1 OR f.user_two = $1)
        AND f.status = 'pending'
        `,
        [userId]
    );

    const incoming = [];
    const outgoing = [];

    for (const row of rows) {
        const request = {
            id: row.id,
            username: row.username,
            avatar: row.avatar,
            bio: row.bio,
        };

        if (row.requested_by && Number(row.requested_by) === Number(userId)) {
            outgoing.push(request);
        } else {
            incoming.push(request);
        }
    }

    return { incoming, outgoing };
}

