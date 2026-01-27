import meRoutes from "./me/index.js";
import friendsRoutes from "./friends/friends.routes.js";
import getByIdRoute from "./getById.js";

export default async function routes(app) {
    app.register(meRoutes, { prefix: "/me" });
    app.register(friendsRoutes, { prefix: "/friends" });
    app.register(getByIdRoute);
    // state routes removed – presence-service now owns presence API
}