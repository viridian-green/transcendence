//const { registerUserModule } = require("./services/user");
const { registerGameModule } = require("./routes/game");

const fastify = require("fastify")({ logger: true });
PORT = 3000;
HOST = "0.0.0.0";

// Register routes
//fastify.register(require("./routes/users"));
//fastify.register(require(".services/game"));
//fastify.register(require('.services/tournament'))

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
