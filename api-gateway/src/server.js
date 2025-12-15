const fastify = require("fastify")({ logger: true });

fastify.register(require("./plugins/auth"));
fastify.register(require("./routes/proxy"));

fastify.listen({ port: 3000, host: "0.0.0.0" });
