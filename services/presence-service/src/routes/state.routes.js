import { redisClient } from "../redis.js";
import { updateUserState, getUserState as getState, getOnlineUsers as getOnline, getBusyUsers as getBusy } from "../presenceService.js";

const ALLOWED_STATES = ["online", "busy", "offline"];

async function checkIfStateIsValid(state) {
  if (!ALLOWED_STATES.includes(state)) {
    const err = new Error(
      `Invalid state. Allowed states: ${ALLOWED_STATES.join(", ")}`
    );
    err.statusCode = 400;
    throw err;
  }
}

async function getUserState(id) {
  return await getState(id);
}

async function getOnlineUsers() {
  return await getOnline();
}

async function getBusyUsers() {
  return await getBusy();
}

export default async function stateRoutes(app) {
  app.patch("/state", async (req, reply) => {
    const { id, state } = req.body;
    if (!id || !state) {
      reply.code(400).send({ error: "Missing id or state" });
      return;
    }

    await checkIfStateIsValid(state);
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

  app.get("/busy-users", async (req, reply) => {
    const users = await getBusyUsers();
    return reply.code(200).send({ users });
  });
}
