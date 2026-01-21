import { getUsernamesByIds } from "../../services/user.service.js";

export default async function getByIdRoute(app) {
    app.get('/:id', async (req, reply) => {
        const { id } = req.params;
        reply.send({ message: `Get user ${id}` });
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
