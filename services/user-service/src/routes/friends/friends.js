export default async function friendsRoute(app) {
    //add friend
    //POST /friends/:id
    app.post('/:id', { preHandler: app.authenticate }, async (req, reply) => {
        const userId = req.user.id;
        const friendId = req.params.id;

        // check if other user exists in db?
        // check if friendship already exists
        // check if userid == friendid
        // check if friendship was already requested and its pending

        const { rows } = await app.pg.query(`INSERT INTO friends (user_one, user_two)
            VALUES ($1, $2)
            RETURNING *`,
        [userId, friendId]
        );

        const friendship = rows;
        console.log(friendship);

        return reply.code(200).send(rows[0]);
    })

    //remove friend
    //DELETE /friends/:id

    //get friends list
    //GET /friends
}