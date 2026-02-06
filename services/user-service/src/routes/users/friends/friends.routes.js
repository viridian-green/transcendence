import {
    ensureUserExists,
    ensureNoExistingFriendship,
    ensureNotSelf,
    createFriendRequest,
    deleteFriendship,
    getFriendsList,
    acceptFriendRequest,
    rejectFriendRequest,
    getPendingFriendRequests
} from '../../../services/friends.service.js';
import { emitFriendRequested, emitFriendAccepted, emitFriendRejected, emitFriendDeleted } from '../../../events/emitFriendRequested.js';

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
        await emitFriendAccepted(app, userId, friendId);
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
        const rows = await rejectFriendRequest(app, userId, friendId);
        await emitFriendRejected(app, userId, friendId);
        return reply.code(200).send({
            message: 'Friend rejected',
            friendship: rows[0]
        });
    })

    // Get pending friend requests (incoming/outgoing)
    // GET /friends/pending
    app.get('/pending', { preHandler: app.authenticate }, async (req, reply) => {
        const userId = req.user.id;
        const pending = await getPendingFriendRequests(app, userId);
        return reply.code(200).send(pending);
    })

    // Get friends list for a specific user
    // GET /friends/:id
    app.get('/:id', { preHandler: app.authenticate }, async (req, reply) => {
        const targetUserId = Number(req.params.id);
        await ensureUserExists(app, targetUserId);
        const friendsMap = await getFriendsList(app, targetUserId);
        const friends = Array.from(friendsMap.values());
        return reply.code(200).send(friends);
    })

    // Add friend
    // POST /friends/:id
    app.post('/:id', { preHandler: app.authenticate }, async (req, reply) => {
        const userId = Number(req.user.id);
        const friendId = Number(req.params.id);

        ensureNotSelf(userId, friendId);
        await ensureUserExists(app, friendId);
        await ensureNoExistingFriendship(app, userId, friendId);
        await emitFriendRequested(app, userId, friendId);

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
        await emitFriendDeleted(app, userId, friendId);
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

