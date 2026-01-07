export const GAME_CONFIG = {
  paddle: {
    width: 10,   
    height: 80,   
    speed: 15    
  },
  ball: {
    radius: 8,    
    speed: 2,   
  },
  canvas: {
    width: 800,   
    height: 400 
  },
  scoreLimit: 11
};

function createInitialState() {

  return {
    paddles: [
      { x: 10, y: GAME_CONFIG.canvas.height / 2 - GAME_CONFIG.paddle.height / 2, dy: 0 },
      { x: GAME_CONFIG.canvas.width - 10 - GAME_CONFIG.paddle.width,
        y: GAME_CONFIG.canvas.height / 2 - GAME_CONFIG.paddle.height / 2,
        dy: 0 },
    ],
    ball: {
      x: GAME_CONFIG.canvas.width / 2,
      y: GAME_CONFIG.canvas.height / 2,
      r: GAME_CONFIG.ball.radius,
      dx: GAME_CONFIG.ball.speed,
      dy: GAME_CONFIG.ball.speed,
    },
    serveRight: true,
    score: { player1: 0, player2: 0 },
    game: {
    gameStatus: 'waiting',
    winner: null
    }
  };
}

function resetBall(state) {
  const { canvas, ball: ballCfg, paddle } = GAME_CONFIG;
  const ball = state.ball;

  ball.x = canvas.width / 2;
  ball.y = ballCfg.radius + Math.random() * (canvas.height - 2 * ballCfg.radius);
  ball.dx = state.serveRight ? Math.abs(ball.dx) : -Math.abs(ball.dx);
  state.serveRight = !state.serveRight;
}

function stopPaddle(state, playerIndex) {
  state.paddles[playerIndex].dy = 0;
}

function clampPaddle(state, paddle) {
  paddle.y = Math.max(
    0,
    Math.min(GAME_CONFIG.canvas.height - GAME_CONFIG.paddle.height, paddle.y)
  );
}

function movePaddle(state, playerIndex, direction) {
  const paddle = state.paddles[playerIndex];
  const speed = GAME_CONFIG.paddle.speed;

  if (direction === 'up') paddle.dy = -speed;
  if (direction === 'down') paddle.dy = speed;
}

function moveBall(state) {
  state.paddles.forEach(p => {
    p.y += p.dy;
    clampPaddle(state, p);
  });

  const { canvas, paddle } = GAME_CONFIG;
  const ball = state.ball;

  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.y - ball.r < 0 || ball.y + ball.r > canvas.height) {
    ball.dy *= -1;
  }

 state.paddles.forEach((p, playerIndex) => {
  const isLeft = playerIndex === 0;
  const paddleTop = p.y;
  const paddleBottom = p.y + paddle.height;
  const paddleLeft = p.x;
  const paddleRight = p.x + paddle.width;

  const withinY = ball.y + ball.r > paddleTop && ball.y - ball.r < paddleBottom;

  if (!withinY) return;

  if (isLeft) {
    const willCross =
      ball.dx < 0 &&
      ball.x - ball.r <= paddleRight &&
      ball.x - ball.dx - ball.r >= paddleRight;

    if (willCross) {
      ball.dx *= -1;
      ball.x = paddleRight + ball.r;
    }
  } else {
    const willCross =
      ball.dx > 0 &&
      ball.x + ball.r >= paddleLeft &&
      ball.x - ball.dx + ball.r <= paddleLeft;

    if (willCross) {
      ball.dx *= -1;
      ball.x = paddleLeft - ball.r;
    }
  }
});

  if (ball.x < 0 || ball.x > canvas.width) {
  state.score[1] += 1;
    checkGameEnd(state);
    resetBall(state);
  } else if (ball.x - ball.r > canvas.width) {
    state.score[0] += 1;
    checkGameEnd(state);
    resetBall(state);
  }
}

function checkGameEnd(state) {
  const limit = state.scoreLimit;
  if (state.score[0] >= limit) {
    state.gameStatus = 'ended';
    state.winner = 0;
  } else if (state.score[1] >= limit) {
    state.gameStatus = 'ended';
    state.winner = 1;
  }
}

function GameLoop(state) {
  moveBall(state);
}

export {createInitialState, stopPaddle, movePaddle, moveBall, GameLoop};

