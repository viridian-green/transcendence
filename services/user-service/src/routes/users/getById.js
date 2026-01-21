import { getUsernamesByIds } from "../../services/user.service.js";

export default async function getByIdRoute(app) {
    app.get('/:id', async (req, reply) => {
        const { id } = req.params;
        reply.send({ message: `Get user ${id}` });
    });

    app.get('/', async (req, reply) => {
        const { ids } = req.query;
        let idsArray = ids.split(',');
        const users = await getUsernamesByIds(app, idsArray);
        reply.send({ users });
    });
}
