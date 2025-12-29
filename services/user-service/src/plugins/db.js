import fastifyPlugin from 'fastify-plugin'
import fastifyPostgres from '@fastify/postgres'
import Postgrator from 'postgrator'
import path from 'path'

async function dbConnector(app, options) {
  // REGISTER THE DATABASE
    app.register(fastifyPostgres, {
        connectionString: process.env.DATABASE_URL
    })

    app.addHook('onReady', async () => {
        const postgrator = new Postgrator({
            migrationPattern: path.join(process.cwd(), 'migrations/*'),
            driver: 'pg',
            database: 'user_db',
            schemaTable: 'schema_migrations',
            execQuery: (query) => app.pg.query(query)
        })

        try {
            const applied = await postgrator.migrate()
            app.log.info({ applied }, 'Database migrations completed')
        } catch (err) {
            app.log.error(err, 'Database migration failed')
            throw err // fail fast in CI
        }
    })

  // CREATE TABLE
//   fastify.addHook('onReady', async () => {
//     try {
//       await fastify.pg.query(`
//         CREATE TABLE IF NOT EXISTS users (
//             id SERIAL PRIMARY KEY,
//             username TEXT UNIQUE NOT NULL,
//             password TEXT NOT NULL,
//             email TEXT NOT NULL,
//             avatar TEXT NOT NULL DEFAULT 'default.png',
//             created_at TIMESTAMP DEFAULT NOW()
//         );
//       `)
//       fastify.log.info('User Table created (or already existed).')
//     } catch (err) {
//       fastify.log.error(err, 'Error creating User table')
//     }
//   })
}

export default fastifyPlugin(dbConnector)
