//const { registerUserModule } = require("./services/user");
const { registerGameModule } = require("./routes/game");

const fastify = require("fastify")({ logger: true });
PORT = 3000;
HOST = "0.0.0.0";


fastify.register(require("./plugins/auth"));
fastify.register(require("./routes/proxy"));

const start = async () => {
  try {
    // Register modules
    //await registerUserModule(fastify);
    await registerGameModule(fastify);

    await fastify.listen({ port: PORT, host: HOST });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
