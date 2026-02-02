import app from "./app.js";
import https from 'https';

const PORT = process.env.PRESENCE_PORT
  ? parseInt(process.env.PRESENCE_PORT, 10)
  : 3005;

const start = async () => {
  try {
    const protocol = app.server instanceof https.Server ? 'https' : 'http';
    await app.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`Presence service running on ${protocol}://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
