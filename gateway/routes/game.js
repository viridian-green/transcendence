const registerGameModule = async (fastify) => {
  // Serve the game HTML page
  fastify.get("/game-service", async (request, reply) => {
    try {
      const response = await fetch("http://game:3002/");
      const data = await response.text();
      reply.type("text/html").send(data);
    } catch (error) {
      reply.code(500).send({ error: "Game service unavailable" });
    }
  });

  // Serve game.js static file
  fastify.get("/game.js", async (request, reply) => {
    try {
      const response = await fetch("http://game:3002/game.js");
      const data = await response.text();
      reply.type("application/javascript").send(data);
    } catch (error) {
      reply.code(500).send({ error: "Game asset unavailable" });
    }
  });
};

module.exports = {
  registerGameModule,
};
