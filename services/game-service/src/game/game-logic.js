export const GAME_CONFIG = {
  paddle: { width: 10, height: 80, speed: 10 },
  ball: { radius: 8, speed: 6, serveSpeed: 0.5, serveFrames: 30 },
  canvas: { width: 800, height: 400 },
  scoreLimit: 11,
  countdownStart: 3,
};

export function createInitialState() {
  return {
    paddles: [
      {
        x: GAME_CONFIG.canvas.width * 0.02,
        y: GAME_CONFIG.canvas.height / 2 - GAME_CONFIG.paddle.height / 2,
        dy: 0,
      },
      {
        x: GAME_CONFIG.canvas.width * 0.98 - GAME_CONFIG.paddle.width,
        y: GAME_CONFIG.canvas.height / 2 - GAME_CONFIG.paddle.height / 2,
        dy: 0,
      },
    ],
    ball: {
      x: GAME_CONFIG.canvas.width / 2,
      y: GAME_CONFIG.canvas.height / 2,
      r: GAME_CONFIG.ball.radius,
      dx: GAME_CONFIG.ball.speed,
      dy: GAME_CONFIG.ball.speed,
      isServing: true,
    },
    serveRight: true,
    score: { player1: 0, player2: 0 },
    game: {
      phase: 'countdown',
      countdown: GAME_CONFIG.countdownStart, 
      winner: null,
    },
  };
}

function resetBall(state) {
  const { canvas, ball: ballCfg } = GAME_CONFIG;
  const ball = state.ball;

  ball.x = canvas.width / 2;
  ball.y = ballCfg.radius + Math.random() * (canvas.height - 2 * ballCfg.radius);
  ball.dx = state.serveRight ? Math.abs(ball.dx) : -Math.abs(ball.dx);
  state.serveRight = !state.serveRight;

  ball.isServing = true;
}

export function stopPaddle(state, playerIndex) {
  state.paddles[playerIndex].dy = 0;
}

function clampPaddle(paddle) {
  paddle.y = Math.max(
    0,
    Math.min(GAME_CONFIG.canvas.height - GAME_CONFIG.paddle.height, paddle.y),
  );
}

export function movePaddle(state, playerIndex, direction) {
  const paddle = state.paddles[playerIndex];
  const speed = GAME_CONFIG.paddle.speed;
  if (direction === 'up') paddle.dy = -speed;
  if (direction === 'down') paddle.dy = speed;
}

export function moveBall(state) {
  const { ball: ballCfg } = GAME_CONFIG;
  const ball = state.ball;

  const speedMultiplier = ball.isServing ? ballCfg.serveSpeed : 1;

  state.paddles.forEach((p) => {
    p.y += p.dy;
    clampPaddle(p);
  });

  const { canvas, paddle } = GAME_CONFIG;

  ball.x += ball.dx * speedMultiplier;
  ball.y += ball.dy * speedMultiplier;

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
        ball.isServing = false;
      }
    } else {
      const willCross =
        ball.dx > 0 &&
        ball.x + ball.r >= paddleLeft &&
        ball.x - ball.dx + ball.r <= paddleLeft;

      if (willCross) {
        ball.dx *= -1;
        ball.x = paddleLeft - ball.r;
        ball.isServing = false;
      }
    }
  });

  if (ball.x + ball.r < 0) {
    state.score.player2 += 1;
    checkGameEnd(state);
    resetBall(state);
  } else if (ball.x - ball.r > canvas.width) {
    state.score.player1 += 1;
    checkGameEnd(state);
    resetBall(state);
  }
}

function checkGameEnd(state) {
  const limit = GAME_CONFIG.scoreLimit;
  if (state.score.player1 >= limit) {
    state.game.phase = 'ended';
    state.game.winner = 0;
  } else if (state.score.player2 >= limit) {
    state.game.phase = 'ended';
    state.game.winner = 1;
  }
}

export function GameLoop(state) {
  if (state.game.phase === 'countdown') {
    if (!state.game._framesLeft) {
      state.game._framesLeft = GAME_CONFIG.countdownStart * 60;
    }

    state.game._framesLeft -= 1;

    const secondsLeft = Math.ceil(state.game._framesLeft / 60);
    state.game.countdown = secondsLeft;

    if (state.game._framesLeft <= 0) {
      state.game.phase = 'playing';
      state.game.countdown = 0;
      delete state.game._framesLeft;
    }

    return;
  }
  if (state.game.phase === 'playing') {
    moveBall(state);
  }
}