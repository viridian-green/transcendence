import fp from 'fastify-plugin'
import dbPlugin from './db.js';
import authPlugin from './auth.js';
import uploadsPlugin from './uploads.js';

export default fp(async function plugins(app) {
    app.register(dbPlugin);
    app.register(authPlugin);
    app.register(uploadsPlugin);
})
