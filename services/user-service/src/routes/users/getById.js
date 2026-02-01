import { getUsernamesByIds } from "../../services/user.service.js";
import { getUserById } from "../../services/user.service.js";

export default async function getByIdRoute(app) {
    app.get('/:id',{ preHandler: app.authenticate }, async (req, reply) => {
        const { id } = req.params;
		const user = await getUserById(app, id);
		return reply.send({ user });
    });

    app.get('/', async (req, reply) => {
        const { ids } = req.query;
        if (!ids) {
            return reply.code(400).send({ error: 'ids parameter is required' });
        }
        const idsArray = ids.split(',').map(id => id.toString());
        const users = await getUsernamesByIds(app, idsArray);
        return reply.send({ users });
    });
}
