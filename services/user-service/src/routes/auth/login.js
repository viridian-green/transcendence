import {
    ensureExistingUsername,
    parseLoginBody,
    ensureValidPassword,
    signToken
 } from "../../services/auth.service.js";

export default async function loginRoute(app) {
    app.post('/', async (req, reply) => {

        const { username, password } = await parseLoginBody(req);

        const user = await ensureExistingUsername(app, username);
        await ensureValidPassword(password, user);

        //later add check for 2fa

        const token = await signToken(app, user);

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
}
