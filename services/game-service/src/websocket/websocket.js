import {createInitialState, stopPaddle, movePaddle, moveBall, GameLoop} from './game/game-logic.js'

export default async function gameWebsocket(fastify){
  fastify.get("/ws/game", { websocket: true }, (connection, req) => {
    console.log("Player connected");

    connection.socket.on('message', msg => {
  const { type, payload } = JSON.parse(msg);

  switch (type) {
    case 'PADDLE_MOVE':
      movePaddle(game.state, payload.playerIndex, payload.direction);
      break;
    case 'PADDLE_STOP':
      stopPaddle(game.state, payload.playerIndex);
      break;
  }
});

});}