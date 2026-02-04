import app from "./app.js";
import { initializePresenceBroadcaster } from "./subscribers/presenceBroadcaster.js";

const PORT = process.env.PRESENCE_PORT
  ? parseInt(process.env.PRESENCE_PORT, 10)
  : 3005;

const start = async () => {
  try {
    await app.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`Presence service running on https://localhost:${PORT}`);
    
    // Initialize Redis subscriber for presence broadcasting
    initializePresenceBroadcaster();
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
