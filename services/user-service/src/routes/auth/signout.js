export default async function signoutRoute(app) {
    app.post('/', async (req, reply) => {
        reply
            .clearCookie('access_token', {
                path: '/',
            })
            .code(200)
            .send({ message: 'Logged out' });
    });
}