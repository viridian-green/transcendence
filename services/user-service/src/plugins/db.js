import fastifyPlugin from 'fastify-plugin'
import fastifyPostgres from '@fastify/postgres'
import Postgrator from 'postgrator'
import path from 'path'
import pg from 'pg'
import fs from 'fs';

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
    const connectionString = buildDatabaseUrl();
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
            throw err
        }
    })
}

function buildDatabaseUrl() {
    const {
        DB_USER,
        DB_HOST,
        DB_PORT,
        DB_NAME,
        DB_PASSWORD_FILE,
    } = process.env;

    if (!DB_PASSWORD_FILE) {
        throw new Error('DB_PASSWORD_FILE is not set');
    }

    const password = fs.readFileSync(DB_PASSWORD_FILE, 'utf8').trim();
    const encodedPassword = encodeURIComponent(password);
    return `postgres://${DB_USER}:${encodedPassword}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
}

export default fastifyPlugin(dbConnector)
