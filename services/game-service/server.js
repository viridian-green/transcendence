const fastify = require("fastify")({ logger: true });
const path = require("path");

const PORT = 3002;
const HOST = "0.0.0.0";

// Register static file plugin
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
  prefix: "/",
});

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: HOST });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
