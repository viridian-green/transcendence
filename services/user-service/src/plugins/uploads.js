import fp from 'fastify-plugin';
import fastifyStatic from '@fastify/static';
import path from 'path';
import multipart from '@fastify/multipart';

export default fp(async function uploadsPlugin(app) {
    app.register(multipart, {
        limits: {
            fileSize: 5 * 1024 * 1024
        }
    });

    // app.register(fastifyStatic, {
    //     root: path.join(process.cwd(), 'uploads/avatars'),
    //     prefix: '/api/users/avatars',
    // });


});

