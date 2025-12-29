import registerRoute from '../auth/register.js';
import loginRoute from '../auth/login.js';
import signoutRoute from '../auth/signout.js';

export default async function authRoutes(app) {
    app.register(registerRoute, { prefix: '/register' });

    app.register(loginRoute, { prefix: '/login' });

    app.register(signoutRoute, { prefix: '/signout' });
}