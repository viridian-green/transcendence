//This was created by Natália in order to test user management service. It's not the official database Vanessa's going to create
import fp from 'fastify-plugin'
import Database from 'better-sqlite3'

export default fp(async (app) => {
    const db = new Database('./database.db');

    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT NOT NULL
        )`
    );

    app.decorate('db', db);
})