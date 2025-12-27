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

export async function createFriendRequest(app, userId, friendId) {
    const userOne = Math.min(userId, friendId);
    const userTwo = Math.max(userId, friendId);
    const { rows } = await app.pg.query(`INSERT INTO friends (user_one, user_two)
            VALUES ($1, $2)
            RETURNING *`,
        [userOne, userTwo]
    );
    return rows[0];
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
        SELECT * FROM friends
        WHERE (user_one = $1) OR (user_two = $1)
        `, [userId]
    )
    return rows;
}