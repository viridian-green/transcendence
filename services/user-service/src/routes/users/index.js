// src/routes/users/index.js
import registerRoute from './register.js';
import loginRoute from './login.js';
import getByIdRoute from './getById.js';
import updateUserRoute from './update.js';
import signoutRoute from './signout.js';

export default async function userRoutes(app) {
    // /users/register
    app.register(registerRoute, { prefix: '/register'});

    // /users/login
    app.register(loginRoute, { prefix: '/login'});

    app.register(signoutRoute, { prefix: '/signout' });

    // /users/:id
    app.register(getByIdRoute);
    app.register(updateUserRoute, { prefix: '/me'});
}