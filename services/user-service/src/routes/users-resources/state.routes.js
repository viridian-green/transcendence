export default async function userStateRoute(app) {
  // Update user state (online/offline/busy)
  app.patch("/state", async (req, reply) => {
    const { id, state } = req.body;
    if (!id || !state) {
      reply.code(400).send({ error: "Missing id or state" });
      return;
    }
    // TODO: Store state in Redis here
    reply.send({ message: `User ${id} state updated to ${state}` });
  });
}
