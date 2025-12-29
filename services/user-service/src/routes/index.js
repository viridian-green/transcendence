import healthRoute from './health.js';
import authRoutes from './auth/index.js';
import userRoutes from './users-resources/index.js';
import meRoutes from './me/index.js';
import friendsRoutes from './friends/index.js';

export default async function routes(app) {
    app.register(healthRoute);

    app.register(authRoutes); //maybe change it to api/auth instead of api/users
    app.register(userRoutes);
    app.register(meRoutes);
    app.register(friendsRoutes);
}
