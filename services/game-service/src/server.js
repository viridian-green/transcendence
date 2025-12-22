const fastify = require("fastify")({ logger: true });
const fastifyPostgres = require("@fastify/postgres");
const path = require("path");

// REGISTER DB
fastify.register(fastifyPostgres, {
  connectionString: process.env.DATABASE_URL
})

// CREATE TABLE
fastify.addHook('onReady', async () => {
  try {
    await fastify.pg.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        tournament_id INTEGER,
        status VARCHAR(20) CHECK (status IN ('RUNNING', 'FINISHED', 'ABORTED')) DEFAULT 'RUNNING',
        mode VARCHAR(20),
        player1_alias VARCHAR(50),
        player2_alias VARCHAR(50),
        player1_score INTEGER DEFAULT 0,
        player2_score INTEGER DEFAULT 0,
        played_at TIMESTAMP DEFAULT NOW()
      );
    `)
    fastify.log.info('Game Table created.')
  } catch (err) {
    fastify.log.error(err, 'Error creating Game table')
  }
})

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
