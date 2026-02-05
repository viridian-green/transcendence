import { AIController } from '../game/AIController.js';
import { createInitialState, stopPaddle, movePaddle, GameLoop, GAME_CONFIG } from '../game/game-logic.js';
import { redisPublisher } from "../redis.js";

const rooms = new Map();

function getOrCreateRoom(gameId, mode) {
  let room = rooms.get(gameId);
  if (!room) {
    const isAI = mode === 'AI';
    room = {
      state: createInitialState(),
      clients: new Set(),
      loopId: null,
      // AI ---------------
      ai: isAI ? new AIController() : null,
      isAIGame: isAI
      // ------------------
    };
    rooms.set(gameId, room);
  }
  return room;
}

export default async function gameWebsocket(fastify) {
  fastify.get('/:gameId', { websocket: true }, (connection, req) => {
    const { gameId } = req.params;
    const { mode } = req.query;
    const ws = connection.socket;

    console.log(`[GAME WS] Client connected to room ${gameId} (mode: ${mode})`);

    const room = getOrCreateRoom(gameId, mode);

    room.clients.add(ws);

    // Set user as busy in presence service
    if (req.user && req.user.id) {
      publishPresenceState(req.user.id, 'busy');
    }

    ws.send(JSON.stringify({ type: 'STATE', payload: buildStateSnapshot(room.state) }));

    startRoomLoop(room);

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

      // Set user as online in presence service if no more clients in room
      if (req.user && req.user.id && room.clients.size === 0) {
        publishPresenceState(req.user.id, 'online');
      }

    if (room.clients.size === 0) {
      console.log('[GAME WS] No clients left, deleting room', gameId);
      stopRoomLoop(room);
      rooms.delete(gameId);
    } else {
        console.log(`[GAME WS] Notifying ${room.clients.size} remaining client(s) in ${gameId}`);
        const payload = JSON.stringify({ type: 'OPPONENT_LEFT' });
        for (const client of room.clients) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
          }
        }
      }
    });

    // Publishes presence state to the presence service
    function publishPresenceState(userId, state) {
      const message = JSON.stringify({ userId, state });
      redisPublisher.publish('presence:state', message);
    }

    ws.on('error', (err) => {
      console.error(`[GAME WS] Error in room ${gameId}:`, err);
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
  Object.assign(state, fresh); //See if this would work for the game!
  break;
    }
    case 'MOVE_PADDLE':
      movePaddle(state, payload.playerIndex, payload.direction);
      break;
    case 'STOP_PADDLE':
      stopPaddle(state, payload.playerIndex);
      break;
    default:
      console.warn('[GAME WS] Unknown message type:', type);
  }
}

function startRoomLoop(room) {
  if (room.loopId) return; // Already running

  room.loopId = setInterval(() => {
    // AI logic
    if (room.isAIGame && room.ai) {
      const aiMove = room.ai.getMove(room.state.ball, room.state.paddles[0], GAME_CONFIG.canvas.height);
      room.state.paddles[0].dy = aiMove;
    }

    // Game update
    GameLoop(room.state);

    // Broadcast to all clients in room
    const json = JSON.stringify({
      type: 'STATE',
      payload: buildStateSnapshot(room.state)
    });

    for (const client of room.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(json);
      }
    }
  }, 1000 / 60);
}

function stopRoomLoop(room) {
  if (room.loopId) {
    clearInterval(room.loopId);
    room.loopId = null;
  }
}