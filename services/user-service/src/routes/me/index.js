import meRoute from '../me/me.js'
import avatarRoute from './../me/avatar.js';

export default async function meRoutes(app) {

    app.register(meRoute);
    app.register(avatarRoute, { prefix: '/avatar' });
}
