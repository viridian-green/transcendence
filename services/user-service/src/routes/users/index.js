// src/routes/users/index.js
import registerRoute from './register.js';
import loginRoute from './login.js';
import signoutRoute from './signout.js';
import meRoute from './me.js'

export default async function userRoutes(app) {
    // /users/register
    app.register(registerRoute, { prefix: '/register'});

    // /users/login
    app.register(loginRoute, { prefix: '/login'});

    app.register(signoutRoute, { prefix: '/signout' });

    // GET /me - get user
    app.register(meRoute, { prefix: '/me'});

}