import bcrypt from "bcryptjs";
import { loginSchema } from "../../schemas/auth.schema.js";

export default async function loginRoute(app) {
    app.post('/', async (req, reply) => {
        const result = loginSchema.safeParse(req.body);

        if (!result.success) {
            return reply.code(400).send({
                error: "Validation error",
                details: result.error.flatten().fieldErrors,
            });
        }

        const { username, password } = result.data;

        const res = await app.pg.query(
            "SELECT * FROM users WHERE username = $1",
            [username]
        );

        const user = res.rows[0];

        if (!user) {
            return reply.code(400).send({ error: "Invalid credentials"});
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return reply.code(400).send({ error: "Invalid credentials"});
        }

        //later add check for 2fa

        const token = app.jwt.sign({ id: user.id, username: user.username });

        reply.setCookie("auth", token, {
            httpOnly: true,
            sameSIte: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
        });

        return reply.send({
            id: user.id,
            username: user.username,
            email: user.email,
         });
    });
}
