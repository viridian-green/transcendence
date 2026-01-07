export const GAME_CONFIG = {
  paddle: {
    width: 2,   
    height: 40,   
    speed: 15    
  },
  ball: {
    radius: 2,    
    speed: 2.0,   
  },
  canvas: {
    width: 800,   
    height: 400 
  }
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
    const withinY = ball.y > p.y && ball.y < p.y + paddle.height;
    const hitLeft  = isLeft && ball.x - ball.r < p.x + paddle.width;
    const hitRight = !isLeft && ball.x + ball.r > p.x;

    if (withinY && (hitLeft || hitRight)) {
      ball.dx *= -1;
      ball.x = isLeft ? p.x + paddle.width + ball.r : p.x - ball.r;
    }
  });

  if (ball.x < 0 || ball.x > canvas.width) {
    resetBall(state);
  }
}

function GameLoop(state) {
  moveBall(state);
}

export {createInitialState, stopPaddle, movePaddle, moveBall, GameLoop};

