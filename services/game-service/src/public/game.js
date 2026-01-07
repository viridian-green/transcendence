const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let p1 = { x: 20,  y: canvas.height / 2 - 40, w: 10, h: 80, dy: 0 };
let p2 = { x: canvas.width - 30, y: canvas.height / 2 - 40, w: 10, h: 80, dy: 0 };
let speed = 4;
let serveRight = true;
let ball = { x: canvas.width/2, y: canvas.height/2, r: 8, dx: speed, dy: 4 }; 

document.addEventListener("keydown", e => {
  if (e.direction === "ArrowUp") p2.dy = -6;
  if (e.direction === "ArrowDown") p2.dy =  6;

  if (e.direction === "w") p1.dy = -6;
  if (e.direction === "s") p1.dy =  6;
});

document.addEventListener("keyup", e => {
  if (["ArrowUp","ArrowDown"].includes(e.direction)) p2.dy = 0;
  if (["w","s"].includes(e.direction)) p1.dy = 0;
});

function update() {
  p1.y += p1.dy;
  p2.y += p2.dy;

  p1.y = Math.max(0, Math.min(canvas.height - p1.h, p1.y));
  p2.y = Math.max(0, Math.min(canvas.height - p2.h, p2.y));

  ball.x += ball.dx;
  ball.y += ball.dy;

  // Bounce on top/bottom
  if (ball.y - ball.r < 0 || ball.y + ball.r > canvas.height)
    ball.dy *= -1;

  // Paddle collision: Player 1
  if (ball.x - ball.r < p1.x + p1.w &&
      ball.y > p1.y && ball.y < p1.y + p1.h) {
    ball.dx *= -1;
    ball.x = p1.x + p1.w + ball.r;
  }

  // Paddle collision: Player 2
  if (ball.x + ball.r > p2.x &&
      ball.y > p2.y && ball.y < p2.y + p2.h) {
    ball.dx *= -1;
    ball.x = p2.x - ball.r;
  }

  // Reset if ball is out of bounds of canvas
if (ball.x < 0 || ball.x > canvas.width) {
    ball.x = canvas.width/2;
    //Serving is at random on y axis
    ball.y = ball.y = ball.r + Math.random() * (canvas.height - 2 * ball.r);

    //ball either serves right or left,
    ball.dx = serveRight ? Math.abs(ball.dx) : -Math.abs(ball.dx);
    serveRight = !serveRight;

    //OPTIONAL: randomizing the serving speed 
    // ball.dy = (Math.random() * 4) - 2;
    // if (ball.dy === 0) ball.dy = 1;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Paddles
  ctx.fillStyle = "white";
  ctx.fillRect(p1.x, p1.y, p1.w, p1.h);
  ctx.fillRect(p2.x, p2.y, p2.w, p2.h);

  // Ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
  ctx.fill();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();