import fastifyPlugin from 'fastify-plugin'
import fastifyPostgres from '@fastify/postgres'
import Postgrator from 'postgrator'
import path from 'path'
import pg from 'pg'

async function waitForDatabase(connectionString, maxRetries = 10, delay = 2000) {
    for (let i = 0; i < maxRetries; i++) {
        const client = new pg.Client({ connectionString })
        try {
            await client.connect()
            await client.query('SELECT 1')
            await client.end()
            return true
        } catch (err) {
            try {
                await client.end()
            } catch {
                // ignore client end errors
            }
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay))
            } else {
                throw err
            }
        }
    }
    return false
}

async function dbConnector(app, options) {
    const connectionString = process.env.DATABASE_URL

    // Wait for database to be ready before registering the plugin
    try {
        app.log.info('Waiting for database to be ready...')
        await waitForDatabase(connectionString, 10, 2000)
        app.log.info('Database is ready, connecting...')
    } catch (err) {
        app.log.error(err, 'Failed to connect to database after retries')
        throw err
    }

    // REGISTER THE DATABASE
    app.register(fastifyPostgres, {
        connectionString: connectionString
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
