import app from './app.js';

const start = async () => {
  try {
    await app.listen({ port: 3002, host: "0.0.0.0" });
    console.log("Server running on http://localhost:3002");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
