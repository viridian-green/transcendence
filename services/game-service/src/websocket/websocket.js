import {createInitialState, stopPaddle, movePaddle, moveBall, GameLoop} from '../game/game-logic.js'

const game = {
  state: createInitialState(),
  clients: new Set(),
};

setInterval(() => {
  moveBall(game.state);
  const snapshot = {
    paddles: {
      left: game.state.paddles[0],
      right: game.state.paddles[1],
    },
    ball: game.state.ball,
  };

  const json = JSON.stringify({ type: 'STATE', payload: snapshot });

  for (const client of game.clients) {
    if (client.readyState === 1) client.send(json);
  }
}, 1000 / 60);


export default async function gameWebsocket(fastify) {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    const ws = connection.socket;
    game.clients.add(ws);

    const snapshot = {
      paddles: {
        left: game.state.paddles[0],
        right: game.state.paddles[1],
      },
      ball: game.state.ball,
    };
    ws.send(JSON.stringify({ type: 'STATE', payload: snapshot }));

    ws.on('message', (msg) => {
      try {
      const { type, payload } = JSON.parse(msg);
      switch (type) {
        case 'MOVE_PADDLE':
          movePaddle(game.state, payload.playerIndex, payload.direction);
          break;
        case 'STOP_PADDLE':
          stopPaddle(game.state, payload.playerIndex);
          break;
      }
    } catch (err) {
      console.error('[GAME WS] WS parse error', err);
  }
    });

      ws.on('message', (msg) => {
    console.log('[GAME WS] Raw message:', msg.toString());
    try {
      const parsed = JSON.parse(msg);
      console.log('[GAME WS] Parsed message:', parsed);

    } catch (err) {
      console.error('[GAME WS] WS parse error', err);
    }
  });

    ws.on('close', () => {
      console.log('[GAME WS] Player disconnected');
      game.clients.delete(ws);
    });
  });
}
