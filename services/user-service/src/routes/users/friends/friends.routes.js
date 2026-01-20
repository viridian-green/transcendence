import {
    ensureUserExists,
    ensureNoExistingFriendship,
    ensureNotSelf,
    createFriendRequest,
    deleteFriendship,
    getFriendsList
} from '../../../services/friends.service.js'

export default async function friendsRoute(app) {
    //add friend
    //POST /friends/:id
    app.post('/:id', { preHandler: app.authenticate }, async (req, reply) => {
        const userId = req.user.id;
        const friendId = Number(req.params.id);

        ensureNotSelf(userId, friendId);
        await ensureUserExists(app, friendId);
        await ensureNoExistingFriendship(app, userId, friendId);

        const friendshipId = await createFriendRequest(app, userId, friendId);

        return reply.code(201).send(friendshipId);
    })

    //remove friend
    //DELETE /friends/:id
    app.delete('/:id', { preHandler: app.authenticate }, async (req, reply) => {
        const userId = req.user.id;
        const friendId = Number(req.params.id);

        ensureNotSelf(userId, friendId);
        await ensureUserExists(app, friendId);

        const rows = await deleteFriendship(app, userId, friendId);
        return reply.code(200).send({
            message: 'Friend removed',
            friendship: rows[0]
        });
    });

    //get friends list
    //GET /friends
    app.get('/', { preHandler: app.authenticate }, async (req, reply) => {
        const userId = req.user.id;
        const rows = await getFriendsList(app, userId);

        return reply.code(200).send(rows);
    })
}