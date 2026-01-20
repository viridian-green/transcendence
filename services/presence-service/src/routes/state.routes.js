import redis from "../redis.js";

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

async function updateUserState(id, state) {
  try {
    await redis.set(`user:state:${id}`, state);
  } catch (err) {
    const error = new Error("Failed to update user state in Redis");
    error.statusCode = 500;
    throw error;
  }
}

async function getUserState(id) {
  try {
    const state = await redis.get(`user:state:${id}`);
    return state || "offline";
  } catch (err) {
    const error = new Error("Failed to get user state from Redis");
    error.statusCode = 500;
    throw error;
  }
}

async function getOnlineUsers() {
  const keys = await redis.keys("user:state:*");
  if (!keys.length) return [];
  const states = await redis.mget(...keys);
  return keys
    .map((key, i) =>
      states[i] === "online" ? key.replace("user:state:", "") : null
    )
    .filter((id) => !!id);
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
    return reply.code(200).send({ message: `User ${id} state updated to ${state}` });
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


