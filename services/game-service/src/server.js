import app from './app.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3002;

const start = async () => {
  try {
    await app.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`Game Service running on https://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
