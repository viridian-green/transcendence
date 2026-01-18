import { createInitialState, stopPaddle, movePaddle, GameLoop } from '../game/game-logic.js';

const rooms = new Map();

function getOrCreateRoom(gameId) {
  let room = rooms.get(gameId);
  if (!room) {
    room = {
      state: createInitialState(),
      clients: new Set(),
    };
    rooms.set(gameId, room);
  }
  return room;
}

export default async function gameWebsocket(fastify) {
  fastify.get('/ws/:gameId', { websocket: true }, (connection, req) => {
    const { gameId } = req.params;
    const ws = connection.socket;

    const room = getOrCreateRoom(gameId);

    room.clients.add(ws);

    ws.send(JSON.stringify({ type: 'STATE', payload: buildStateSnapshot(room.state) }));

    ws.on('message', (msg) => {
      try {
        const message = JSON.parse(msg.toString());
        handleWebSocketMessage(message, room.state);
      } catch (err) {
        console.error('[GAME WS] WS parse error', err);
      }
    });

    ws.on('close', () => {
      console.log('[GAME WS] Player disconnected from room', gameId);
      room.clients.delete(ws);
      
    if (room.clients.size === 0) {
      console.log('[GAME WS] No clients left, deleting room', gameId);
      rooms.delete(gameId);

      console.log('[GAME WS] Opponent left, notifying remaining client(s)', gameId);
  const payload = JSON.stringify({ type: 'OPPONENT_LEFT' });

  for (const client of room.clients) {
    if (client.readyState === 1)
      client.send(payload);
    }
  room.state.game.phase = 'ended';
    };
  });
  });
}

function buildStateSnapshot(state) {
  return {
    paddles: {
      left: state.paddles[0],
      right: state.paddles[1],
    },
    ball: state.ball,
    scores: {
      left: state.score.player1,
      right: state.score.player2,
    },
    phase: state.game.phase,
    countdown: state.game.countdown,
  };
}

function handleWebSocketMessage(message, state) {
  const { type, payload } = message;
  switch (type) {
case 'RESET_GAME':
  {
  const fresh = createInitialState();
  state.paddles = fresh.paddles;
  state.ball = fresh.ball;
  state.score = fresh.score;
  state.game = fresh.game;
  break;
    }
    case 'MOVE_PADDLE':
      movePaddle(state, payload.playerIndex, payload.direction);
      break;
    case 'STOP_PADDLE':
      stopPaddle(state, payload.playerIndex);
      break;
    case 'TOGGLE_PAUSE':
      togglePause(state);
      break;
    default:
      console.warn('[GAME WS] Unknown message type:', type);
  }
}

setInterval(() => {
  for (const [, room] of rooms) {
    GameLoop(room.state);
    const json = JSON.stringify({ type: 'STATE', payload: buildStateSnapshot(room.state) });
    for (const client of room.clients) {
      if (client.readyState === 1) client.send(json);
    }
  }
}, 1000 / 60);