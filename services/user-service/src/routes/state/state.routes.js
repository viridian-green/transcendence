import redis from "../../../redis/index.js";

export default async function userStateRoute(app) {
  // Update user state (online/offline/busy)
  console.log("Registering user state routes");
  // Only allow these states
  const allowedStates = ["online", "busy", "offline"];
  app.patch("/state", async (req, reply) => {
    const { id, state } = req.body;
    if (!id || !state) {
      reply.code(400).send({ error: "Missing id or state" });
      return;
    }
    if (!allowedStates.includes(state)) {
      reply.code(400).send({
        error: `Invalid state. Allowed states: ${allowedStates.join(", ")}`,
      });
      return;
    }
    try {
      await redis.set(`user:state:${id}`, state);
    } catch (err) {
      reply.code(500).send({ error: "Failed to update user state in Redis" });
      return;
    }
    reply.send({ message: `User ${id} state updated to ${state}` });
  });
}
