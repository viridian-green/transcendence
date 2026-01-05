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
    width: 100,   
    height: 200 
  }
};

function createPaddle(x, y) {
  return {
    x,
    y,
    dy: 0
  };
}

const paddles = [
  createPaddle(10, GAME_CONFIG.canvas.height / 2 - GAME_CONFIG.paddle.height / 2),
  createPaddle(
    GAME_CONFIG.canvas.width - 10 - GAME_CONFIG.paddle.width,
    GAME_CONFIG.canvas.height / 2 - GAME_CONFIG.paddle.height / 2
  )
]; 

let serveRight = true;
let ball = {
  x: GAME_CONFIG.canvas.width / 2,
  y: GAME_CONFIG.canvas.height / 2,
  r: GAME_CONFIG.ball.radius,
  dx: GAME_CONFIG.ball.speed,
  dy: GAME_CONFIG.ball.speed
};

document.addEventListener("keydown", e => {
  if (e.key === "w") paddles[0].dy = -GAME_CONFIG.paddle.speed;
  if (e.key === "s") paddles[0].dy =  GAME_CONFIG.paddle.speed;

  if (e.key === "ArrowUp") paddles[1].dy = -GAME_CONFIG.paddle.speed;
  if (e.key === "ArrowDown") paddles[1].dy =  GAME_CONFIG.paddle.speed;
});

document.addEventListener("keyup", e => {
  if (["w", "s"].includes(e.key)) paddles[0].dy = 0;
  if (["ArrowUp", "ArrowDown"].includes(e.key)) paddles[1].dy = 0;
});


function resetBall() {
  ball.x = GAME_CONFIG.canvas.width / 2;
  ball.y =
    ball.r +
    Math.random() * (GAME_CONFIG.canvas.height - 2 * ball.r);

  ball.dx = serveRight
    ? Math.abs(ball.dx)
    : -Math.abs(ball.dx);

  serveRight = !serveRight;
}

function movePaddle(paddle) {
  paddle.y += paddle.dy;

  paddle.y = Math.max(
    0,
    Math.min(
      GAME_CONFIG.canvas.height - GAME_CONFIG.paddle.height,
      paddle.y
    )
  );
}


function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  if (
    ball.y - ball.r < 0 ||
    ball.y + ball.r > GAME_CONFIG.canvas.height
  ) {
    ball.dy *= -1;
  }

  paddles.forEach((paddle, index) => {
    const isLeftPaddle = index === 0;

    if (
      ball.y > paddle.y &&
      ball.y < paddle.y + GAME_CONFIG.paddle.height &&
      (
        isLeftPaddle
          ? ball.x - ball.r < paddle.x + GAME_CONFIG.paddle.width
          : ball.x + ball.r > paddle.x
      )
    ) {
      ball.dx *= -1;
      ball.x = isLeftPaddle
        ? paddle.x + GAME_CONFIG.paddle.width + ball.r
        : paddle.x - ball.r;
    }
  });

  if (
    ball.x < 0 ||
    ball.x > GAME_CONFIG.canvas.width
  ) {
    resetBall();
  }
}

function GameLoop() {
  paddles.forEach(movePaddle);
  moveBall();
}

