import Fastify from "fastify";
import dotenv from "dotenv";
import stateRoutes from "./routes/state.routes.js";

dotenv.config();

const app = Fastify({
  logger: true,
});

app.register(stateRoutes, { prefix: "/" });

await app.ready();
console.log(app.printRoutes());

export default app;


