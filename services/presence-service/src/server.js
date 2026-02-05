import app from "./app.js";

if (!process.env.PRESENCE_PORT) {
  console.error('ERROR: PRESENCE_PORT environment variable is required');
  process.exit(1);
}
const PORT = parseInt(process.env.PRESENCE_PORT, 10);

const start = async () => {
  try {
    await app.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`Presence service running on https://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
