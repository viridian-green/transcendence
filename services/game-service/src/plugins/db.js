import fastifyPlugin from 'fastify-plugin'
import fastifyPostgres from '@fastify/postgres'
import Postgrator from 'postgrator'
import path from 'path'

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
