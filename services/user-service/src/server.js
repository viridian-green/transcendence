import app from './app.js';

const start = async() => {
    try {
        await app.listen({ port: 3003, host: "0.0.0.0" });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();