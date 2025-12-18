import app from './app.js';

const start = async() => {
    try {
        await app.listen({ port: 3003, host: "0.0.0.0" });
        console.log("Server running on http://localhost:3003");
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();