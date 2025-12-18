const fastify = require("fastify")({ logger: true });

const start = async () => {
  try {
    // Register plugins
    await fastify.register(require("./plugins/auth"));

    // Register route modules
    await fastify.register(require("./routes/game"));
    await fastify.register(require("./routes/user"));

    await fastify.listen({ port: 3000, host: "0.0.0.0" });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
