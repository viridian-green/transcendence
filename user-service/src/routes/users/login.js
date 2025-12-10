import db from "../../plugins/db.js";

export default async function loginRoute(app) {
    app.post('/', async (req, reply) => {
        const { username, password } = req.body;
        if (!username || !password) {
            return reply.code(400).send({ error: "Missing username or password"});
        }

        const user = await db.prepare("SELECT * FROM users WHERE username = ?").get(username);
        if (!user) {
            return reply.code(401).send({ error: "Invalid credentials"});
        }

        const isValid = await bcrypt.compare(password, user.password); //can i use bcrypt or does that violate the exercise?
        if (!isValid) {
            return reply.code(401).send({ error: "Invalid credentials"});
        }

        //later add check for 2fa

        const token = app.jwt.sign({ id: user.id, username: user.username }); //check this also
        return reply.send({ accessToken: token });
    });
}
