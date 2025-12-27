import {
    parseRegisterBody,
    ensureNotExistingEmail,
    ensureNotExistingUsername,
    hashPassword,
    insertUserInDb,
    signToken
} from "../../services/auth.service.js"

export default async function registerRoute(app) {
app.post('/', async (req, reply) => {

    const { username, password, email } = await parseRegisterBody(req);

        await ensureNotExistingEmail(app, email);
        await ensureNotExistingUsername(app, username);

        const hashedPassword = await hashPassword(password);
        const user = await insertUserInDb(app, username, hashedPassword, email);
        const token = await signToken(app, user);

        return reply
            .setCookie('access_token', token, {
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                path: '/',
            })
            .code(201)
            .send(user);
    });
}
