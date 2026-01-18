import meRoutes from './me/index.js';
import friendsRoutes from './friends/friends.routes.js';
import stateRoutes from './state/state.routes.js';

export default async function routes(app) {
    app.register(meRoutes, { prefix: '/me' });
    app.register(friendsRoutes, { prefix: '/friends' });
    app.register(stateRoutes, { prefix: '/state' });
    //await stateRoutes(app);
}