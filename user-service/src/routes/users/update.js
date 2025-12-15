export default async function updateRoute(app) {
    app.patch(':/id', async (req, reply) => {
        const { id } = req.params;
        reply.send({ message: `Update user ${id}` });
    });
}