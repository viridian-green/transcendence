import {
    parseRegisterBody,
    ensureNotExistingEmail,
    ensureNotExistingUsername,
    hashPassword,
    insertUserInDb,
    signToken,
    parseLoginBody,
    ensureExistingEmail,
    ensureValidPassword,
    ensureUserIsNotOnline
} from "../../services/auth.service.js";
/**
 * Authentication routes
 * Handles user registration, login, and signout
 */
export default async function authRoutes(app) {
    // Register a new user
    app.post("/register", async (req, reply) => {
        const { username, password, email } = await parseRegisterBody(req);

        await ensureNotExistingEmail(app, email);
        await ensureNotExistingUsername(app, username);

        const hashedPassword = await hashPassword(password);
        const user = await insertUserInDb(app, username, hashedPassword, email);
        const token = await signToken(app, user);

        return reply
            .setCookie("access_token", token, {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                path: "/",
            })
            .code(201)
            .send(user);
    });

    // Login user
    app.post("/login", async (req, reply) => {
        const { email, password } = await parseLoginBody(req);

        const user = await ensureExistingEmail(app, email);
        await ensureValidPassword(password, user);

        const token = await signToken(app, user);
        await ensureUserIsNotOnline(app, user.id);
        return reply
            .setCookie("access_token", token, {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                path: "/",
            })
            .code(200)
            .send({
                id: user.id,
                username: user.username,
                email: user.email,
            });
    });

    // Sign out user
    app.post("/signout", async (req, reply) => {
        return reply
            .clearCookie("access_token", {
                path: "/",
            })
            .code(200)
            .send({ message: "Logged out" });
    });
}

