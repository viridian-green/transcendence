import bcrypt from "bcryptjs";

export default async function registerRoute(app) {
    app.post('/', async (req, reply) => {

        const { username, password, email } = req.body;

        if (!username || !password || !email) {
            return reply.code(400).send({ error: "Username, password and email required" });
        }

        const existingUser = app.db
            .prepare("SELECT * FROM users WHERE username = ?")
            .get(username);

        if (existingUser) {
            return reply.code(400).send({ error: "Username already taken" });
        }

        const existingEmail = app.db
            .prepare("SELECT * FROM users WHERE email = ?")
            .get(email);

        if (existingEmail) {
            return reply.code(400).send({ error: "Email already registered" });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const stmt = app.db.prepare(`
            INSERT INTO users (username, password, email)
            VALUES (?, ?, ?)
        `);

        stmt.run(username, hashedPassword, email);

        return reply.send({ message: "User registered successfully" });
    });
}
