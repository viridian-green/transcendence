import { registerSchema } from "../schemas/auth.schema.js"
import { loginSchema } from "../schemas/auth.schema.js";

import bcrypt from "bcryptjs";

export function parseRegisterBody(req) {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
        const err = new Error('Validation error');
        err.statusCode = 400;
        err.details = result.error.format();
        throw err;
    };
    return result.data;
}

export async function ensureNotExistingUsername(app, username) {
    const existingUser = await app.pg.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
    );
    if (existingUser.rows.length > 0) {
        const err = new Error('Username taken');
        err.statusCode = 409;
        throw err;
    }
}

export async function ensureNotExistingEmail(app, email) {
    const existingEmail = await app.pg.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );
    if (existingEmail.rows.length > 0) {
        const err = new Error('Email already registered');
        err.statusCode = 409;
        throw err;
    }
}

export async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

export async function insertUserInDb(app, username, hashedPassword, email) {
    const { rows } = await app.pg.query(
        `INSERT INTO users (username, password, email)
            VALUES ($1, $2, $3)
            RETURNING id, username, email`,
        [username, hashedPassword, email]
    );
    return rows[0];
}

export function signToken(app, user) {
    return app.jwt.sign({
        id: user.id,
        username: user.username,
    });
}

export function parseLoginBody(req) {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        const err = new Error('Validation error');
        err.statusCode = 400;
        err.details = result.error.format();
        throw err;
    };

    return result.data;
}

export async function ensureExistingEmail(app, email) {
    const { rows } = await app.pg.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );
    if (rows.length === 0) {
        const err = new Error("Invalid credentials");
        err.statusCode = 401;
        throw err;
    }
    return rows[0];
}

export async function ensureValidPassword(password, user) {
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        const err = new Error("Invalid credentials");
        err.statusCode = 401;
        throw err;
    }
}

export async function ensureUserIsNotOnline(app, userId) {
    const response = await fetch(`http://presence:3005/state/${userId}`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        const err = new Error("Failed to check user state");
        err.statusCode = 500;
        throw err;
    }

    const userState = await response.json();

    if (userState.state === "online") {
        const err = new Error("User is already online");
        err.statusCode = 419;
        throw err;
    }
}
/**
 * Authenticate middleware - reads user info from headers
 * The API Gateway handles JWT verification and passes user info via headers
 */
export async function authenticate(request, reply) {
    const userId = request.headers['x-user-id'];
    const username = request.headers['x-username'];

    if (!userId) {
        const err = new Error("Missing user authentication");
        err.statusCode = 401;
        throw err;
    }

    // Attach user info to request for use in routes
    request.user = {
        id: parseInt(userId, 10),
        username: username
    };
}


export async function optionalAuth(request, reply) {
    const userId = request.headers['x-user-id'];
    const username = request.headers['x-username'];

    if (userId) {
        request.user = {
            id: parseInt(userId, 10),
            username: username
        };
    }
}