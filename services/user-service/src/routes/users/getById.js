export default async function getByIdRoute(app) {
    app.get('/:id', async (req, reply) => {
        const { id } = req.params;
        reply.send({ message: `Get user ${id}` });
    });
}