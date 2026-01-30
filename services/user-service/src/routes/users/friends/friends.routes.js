import {
    ensureUserExists,
    ensureNoExistingFriendship,
    ensureNotSelf,
    createFriendRequest,
    deleteFriendship,
    getFriendsList,
    acceptFriendRequest
} from '../../../services/friends.service.js';

//import { notifyFriendInviteWS } from '../../../utils/notifyFriendInviteWS.js';

export default async function friendsRoute(app) {
    // Accept friend request - must come before /:id to avoid route conflict
    // POST /friends/:id/accept
    app.post('/:id/accept', { preHandler: app.authenticate }, async (req, reply) => {
        const userId = req.user.id;
        const friendId = Number(req.params.id);

        ensureNotSelf(userId, friendId);
        await ensureUserExists(app, friendId);
        //await ensureNoExistingFriendship(app, userId, friendId);
        const friendshipId = await acceptFriendRequest(app, userId, friendId);
        return reply.code(200).send(friendshipId);
    })

    // Reject friend request - must come before /:id to avoid route conflict
    // POST /friends/:id/reject
    app.post('/:id/reject', { preHandler: app.authenticate }, async (req, reply) => {
        const userId = req.user.id;
        const friendId = Number(req.params.id);

        ensureNotSelf(userId, friendId);
        await ensureUserExists(app, friendId);
        //await ensureNoExistingFriendship(app, userId, friendId);
        const rows = await deleteFriendship(app, userId, friendId);
        return reply.code(200).send({
            message: 'Friend rejected',
            friendship: rows[0]
        });
    })

    // Add friend
    // POST /friends/:id
    app.post('/:id', { preHandler: app.authenticate }, async (req, reply) => {
        const userId = req.user.id;
        const friendId = Number(req.params.id);

        ensureNotSelf(userId, friendId);
        await ensureUserExists(app, friendId);
        await ensureNoExistingFriendship(app, userId, friendId);

        const friendshipId = await createFriendRequest(app, userId, friendId);

        // Notify the invited user via WebSocket
        notifyFriendInviteWS(friendId, userId, req.user.username);

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
        const friendsMap = await getFriendsList(app, userId);
        const friends = Array.from(friendsMap.values());

        return reply.code(200).send(friends);
    })
}

