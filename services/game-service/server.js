const path = require('path');
const fastify = require('fastify')({ logger: true });

const start = async () => {
  try {
    const address = await fastify.listen({ port: 3002, host: '0.0.0.0' });
    fastify.log.info(`Pong running at ${address}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();