import app from './app.js';
import seed from './seed.js';

const start = async() => {
    try {
        await app.listen({ port: 3003, host: "0.0.0.0" });
		await seed();
        console.log("Server running on http://localhost:3003");
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();