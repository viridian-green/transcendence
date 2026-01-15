import dbPlugin from './db.js';

export default fp(async function plugins(app) {
    app.register(dbPlugin);
})