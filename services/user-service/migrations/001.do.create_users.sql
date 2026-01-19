CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT NOT NULL,
            avatar TEXT NOT NULL DEFAULT 'default.png',
            created_at TIMESTAMP DEFAULT NOW(),
            state TEXT DEFAULT 'offline'
);