import fp from 'fastify-plugin';
import fastifyStatic from '@fastify/static';
import path from 'path';
import multipart from '@fastify/multipart';

async function uploadsPlugin(app) {
    app.register(multipart);

    app.register(fastifyStatic, {
        root: path.join(process.cwd(), 'uploads/avatars'),
        prefix: '/api/users/avatars',
    });
}

export default fp(uploadsPlugin);