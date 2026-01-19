import { checkIfStateIsValid, updateUserState, getUserState } from "../../../services/state.service.js";
export default async function userStateRoute(app) {
  app.patch("/", async (req, reply) => {
    const { id, state } = req.body;
    if (!id || !state) {
      reply.code(400).send({ error: "Missing id or state" });
      return;
    }

    checkIfStateIsValid(state);
    await updateUserState(id, state);

    return reply.code(200).send({ message: `User ${id} state updated to ${state}` });
  });

  app.get("/:id", async (req, reply) => {
    const { id } = req.params;
    const state = await getUserState(id);
    return reply.code(200).send({ state });
  });
}
