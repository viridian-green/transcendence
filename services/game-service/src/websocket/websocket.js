import {createInitialState, stopPaddle, movePaddle, moveBall, GameLoop} from '../game/game-logic.js'

const game = {
  state: createInitialState(),
  clients: new Set(),
};    

export default async function gameWebsocket(fastify) {
  fastify.get('/ws', { websocket: true }, (connection, req) => {
    const ws = connection.socket;
    game.clients.add(ws);

    ws.send(JSON.stringify({ type: 'STATE', payload: buildStateSnapshot() }));

    ws.on('message', (msg) => {
      try {
        const message = JSON.parse(msg.toString());
        handleWebSocketMessage(message);
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

function buildStateSnapshot() {
    return {
      paddles: {
        left: game.state.paddles[0],
        right: game.state.paddles[1],
      },
      ball: game.state.ball,
      scores: {
        left: game.state.score.player1,
        right: game.state.score.player2,
      },
      phase: game.state.game.phase,
      countdown: game.state.game.countdown,
    };
}

function handleWebSocketMessage(message) {
  const { type, payload } = message;

  switch (type) {
    case 'MOVE_PADDLE':
      movePaddle(game.state, payload.playerIndex, payload.direction);
      break;
    case 'STOP_PADDLE':
      stopPaddle(game.state, payload.playerIndex);
      break;
    case 'TOGGLE_PAUSE':
      togglePause(game.state);
      break;
    default:
      console.warn('[GAME WS] Unknown message type:', type);
  }
}

setInterval(() => {
GameLoop(game.state);

  const json = JSON.stringify({ type: 'STATE', payload: buildStateSnapshot() });

  for (const client of game.clients) {
    if (client.readyState === 1) client.send(json);
  }
}, 1000 / 60);

