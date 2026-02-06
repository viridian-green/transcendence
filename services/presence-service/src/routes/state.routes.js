import { updateUserState, getUserState, getOnlineUsers } from "../presenceService.js";

export default async function stateRoutes(app) {
  app.patch("/state", async (req, reply) => {
    const { id, state } = req.body;
    if (!id || !state) {
      reply.code(400).send({ error: "Missing id or state" });
      return;
    }

    await updateUserState(id, state);
    return reply
      .code(200)
      .send({ message: `User ${id} state updated to ${state}` });
  });

  app.get("/state/:id", async (req, reply) => {
    const { id } = req.params;
    const state = await getUserState(id);
    return reply.code(200).send({ state });
  });

  app.get("/online-users", async (req, reply) => {
    const users = await getOnlineUsers();
    return reply.code(200).send({ users });
  });
}
