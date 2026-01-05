import meRoute from '../me/me.js'
import avatarRoute from './../me/avatar.js';

export default async function meRoutes(app) {

    app.register(meRoute, { prefix: '/me' });
    app.register(avatarRoute, { prefix: '/avatar' });
}
