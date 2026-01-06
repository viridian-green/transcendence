const fastifyPostgres = require("@fastify/postgres");
const path = require("path");
import Fastify from "fastify";
import websocket from "@fastify/websocket";
import gameWebsocket from './websocket/websocket.js';

const fastify = Fastify({
    logger: true
});

fastify.register(websocket);
fastify.register(gameWebsocket);
