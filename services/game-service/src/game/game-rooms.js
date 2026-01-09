import { createInitialState, stopPaddle, movePaddle, togglePause, GameLoop } from '../game/game-logic.js';

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