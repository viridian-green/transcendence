import fastifyPlugin from 'fastify-plugin'
import fastifyPostgres from '@fastify/postgres'
import Postgrator from 'postgrator'
import path from 'path'
import fs from 'fs';

async function dbConnector(app, options) {
    app.register(fastifyPostgres, {
        connectionString: buildDatabaseUrl(),
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

    return `postgres://${DB_USER}:${password}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
}

export default fastifyPlugin(dbConnector)
