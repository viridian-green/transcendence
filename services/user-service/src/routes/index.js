import healthRoute from './health.js';
import authRoutes from './auth.routes.js';
import userRoutes from './users-resources/index.js';
import meRoutes from './me/index.js';
import friendsRoutes from './friends/index.js';
import stateRoutes from './state/state.routes.js';

export default async function routes(app) {
    app.register(healthRoute);

    app.register(authRoutes, { prefix: '/auth' });

    app.register(userRoutes, { prefix: '/users'});
    app.register(meRoutes, { prefix: '/users/me'});
    app.register(friendsRoutes, { prefix: '/users/friends'});
    app.register(stateRoutes, { prefix: '/users/state' });
    await stateRoutes(app);
}
