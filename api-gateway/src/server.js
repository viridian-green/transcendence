const fastify = require("fastify")({ logger: true });

const start = async () => {
  await fastify.register(require("./plugins/auth"));
  await fastify.register(require("./routes/proxy"));
  await fastify.register(require("./routes/game"));

  await fastify.listen({ port: 3000, host: "0.0.0.0" });
};

start();
