const fp = require("fastify-plugin");
const jwt = require("jsonwebtoken");

async function authPlugin(fastify) {
    fastify.addHook("onRequest", async (request, reply) => {
        const url = request.raw.url;

        if (url.startsWith("/api/auth")) {
            return;
        }

        const header = request.headers.authorization;
        if (!header) {
            reply.code(401).send({ message: "Missing token" });
            return;
        }

        const token = header.split(" ")[1];

        try {
            const payload = jwt.verify(token, process.env.JWT_PUBLIC_KEY);

            if (
                payload.type === "2fa_pending" &&
                !url.startsWith("/api/auth/2fa")
            ) {
                reply.code(403).send({ message: "2FA required" });
                return;
            }
            request.user = payload;
        } catch {
            reply.code(401).send({ message: "Invalid token" });
        }
    });
}

module.exports = fp(authPlugin);
