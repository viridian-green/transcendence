import {createInitialState, stopPaddle, movePaddle, moveBall, GameLoop} from './game/game-logic.js'

const game = {
  state: createInitialState(),
  clients: new Set(),
};

export default async function gameWebsocket(fastify){
  fastify.get("/", { websocket: true }, (connection, req) => {
    console.log("Player connected");

    const ws = connection.socket;
    game.clients.add(ws);

    const snapshot = {
      paddles: game.state.paddles,
      ball: game.state.ball,
    };
    ws.send(JSON.stringify({ type: 'STATE', payload: snapshot }));

    ws.on('message', msg => {
      try {
        const { type, payload } = JSON.parse(msg);

        switch (type) {
          case 'PADDLE_MOVE':
            movePaddle(game.state, payload.playerIndex, payload.direction);
            break;
          case 'PADDLE_STOP':
            stopPaddle(game.state, payload.playerIndex);
            break;
        }
      } catch (err) {
        console.error('WS parse error', err);
      }
    });

    ws.on('close', () => {
      console.log('Player disconnected');
      game.clients.delete(ws);
    });
  });
}

setInterval(() => {
    moveBall(game.state);
    const snapshot = {
      paddles: game.state.paddles,
      ball: game.state.ball,
    };
    const json = JSON.stringify({ type: 'STATE', payload: snapshot });

    for (const client of game.clients) {
      if (client.readyState === 1) client.send(json);
    }
  }, 1000 / 60);