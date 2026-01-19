import meRoute from './me.routes.js'

export default async function meRoutes(app) {

    app.register(meRoute);
}
