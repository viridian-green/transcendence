import {createInitialState, stopPaddle, movePaddle, moveBall, GameLoop} from './game/game-logic.js'

const game = {
  state: createInitialState(),
  clients: new Set(),
};

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