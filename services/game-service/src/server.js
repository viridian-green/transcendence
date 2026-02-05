import app from './app.js';

if (!process.env.PORT) {
  console.error('ERROR: PORT environment variable is required');
  process.exit(1);
}
const PORT = parseInt(process.env.PORT, 10);

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
