import friendRoute from '../friends/friends.js'

export default async function userRoutes(app) {

    //Get friends(friend list), Post friends/:id (add friend), Delete friends/:id
    app.register(friendRoute, { prefix: '/friends' })
}