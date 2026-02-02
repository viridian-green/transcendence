import app from './app.js';
import https from 'https';

const start = async() => {
    try {
        const protocol = app.server instanceof https.Server ? 'https' : 'http';
        await app.listen({ port: 3003, host: "0.0.0.0" });
        console.log(`User Service running on ${protocol}://localhost:3003`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();