import bcrypt from "bcryptjs";
import { registerSchema } from "../../schemas/auth.schema.js"

export default async function registerRoute(app) {
    app.post('/', async (req, reply) => {

        const result = registerSchema.safeParse(req.body);

        if (!result.success) {
            return reply.code(400).send({
                error: "Validation error",
                details: result.error.flatten().fieldErrors,
            });
        }

        const { username, password, email } = result.data;

        const existingUser = await app.pg.query(
            "SELECT * FROM users WHERE username = $1",
            [username]
        );

        if (existingUser.rows.length > 0) {
            return reply.code(409).send({ error: "Username already taken" });
        }

        const existingEmail = await app.pg.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existingEmail.rows.length > 0) {
            return reply.code(409).send({ error: "Email already registered" });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        await app.pg.query(
            "INSERT INTO users (username, password, email) VALUES ($1, $2, $3)",
            [username, hashedPassword, email]
        );

        return reply
            .code(201)
            .send({
                id: user.id,
                username: user.username,
                email: user.email,
            });
    });
}
