import redis from "../../redis/index.js";

export async function checkIfStateIsValid(state) {
    const allowedStates = ["online", "busy", "offline"]
    if (!allowedStates.includes(state)) {
        const err = new Error(`Invalid state. Allowed states: ${allowedStates.join(", ")}`)
        err.statusCode = 400;
        throw err;
    };
}

export async function updateUserState(id, state) {
    try {
        await redis.set(`user:state:${id}`, state);
    } catch (err) {
        const error = new Error("Failed to update user state in Redis");
        error.statusCode = 500;
        throw error;
    }
}

export async function getUserState(id) {
    try {
        const state = await redis.get(`user:state:${id}`);
        return state || 'offline';  // Fallback to 'offline' if null
    } catch (err) {
        const error = new Error("Failed to get user state from Redis");
        error.statusCode = 500;
        throw error;
    }
}