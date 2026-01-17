
import fastifyPostgres from '@fastify/postgres';

import Fastify from "fastify";
import websocket from "@fastify/websocket";
import gameWebsocket from './websocket/websocket.js';

const app = Fastify({ logger: true });

// const fastifyPostgres = require("@fastify/postgres");
// const path = require("path");

app.register(websocket);
app.register(gameWebsocket);

export default app;
