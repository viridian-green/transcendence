import healthRoute from './health.js';
import authRoutes from './auth/auth.routes.js';
import userRoutes from './users/index.js';

export default async function routes(app) {
    app.register(healthRoute);

    app.register(authRoutes, { prefix: '/auth' });

    app.register(userRoutes, { prefix: '/users'});
}
