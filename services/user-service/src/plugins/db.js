import fastifyPlugin from 'fastify-plugin'
import fastifyPostgres from '@fastify/postgres'
import Postgrator from 'postgrator'
import path from 'path'

async function dbConnector(app, options) {
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is required')
    }

    // REGISTER THE DATABASE
    app.register(fastifyPostgres, {
        connectionString: connectionString,

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
}

export default fastifyPlugin(dbConnector)
