import bcrypt from "bcryptjs";
import { updateUserSchema } from "../../schemas/auth.schema.js";

export default async function updateRoute(app) {
    app.put('/me', { preHandler: app.authenticate }, async (req, reply) => {
        //await request.jwtVerify(); //check into preHandler later

        const userId = req.user.id;

        const parsed = updateUserSchema.safeParse(req.body);
        if (!parsed.success) {
            return reply.code(400).send({ error: parsed.error.errors });
        }

        const updateData = parsed.data;

        if (updateData.password) {
            updateData.password = bcrypt.hash(updateData.password, 10);
        }

        // ------ encapsulate this later
        //const updatedUser = await userService.updatedUser(userId, updateData);
        const fields = [];
        const values = [];
        let index = 1;

        for (const [key, value] of Object.entries(updateData)) {
            fields.push(`${key} = $${index++}`);
            values.push(value);
        }

        values.push(userId);

        const query = `
        UPDATE users
        SET ${fields.join(", ")}
        WHERE id = $${index}
        RETURNING id, username, email
      `;

        const { rows } = await app.pg.query(query, values);

        if (rows.length === 0) {
            return reply.code(404).send({ error: "User not found" });
        }
        //------------------------------

        return reply.send(rows[0]);
    });
}
