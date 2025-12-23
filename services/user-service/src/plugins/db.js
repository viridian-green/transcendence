import fastifyPlugin from 'fastify-plugin'
import fastifyPostgres from '@fastify/postgres'

async function dbConnector(fastify, options) {

  // REGISTER THE DATABASE
  fastify.register(fastifyPostgres, {
    connectionString: process.env.DATABASE_URL
  })

  // CREATE TABLE
  fastify.addHook('onReady', async () => {
    try {
      await fastify.pg.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT NOT NULL,
            avatar TEXT NOT NULL DEFAULT 'default.png',
            created_at TIMESTAMP DEFAULT NOW()
        );
      `)
      fastify.log.info('User Table created (or already existed).')
    } catch (err) {
      fastify.log.error(err, 'Error creating User table')
    }
  })
}

export default fastifyPlugin(dbConnector)
