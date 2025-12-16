const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let p1 = { x: 20,  y: canvas.height / 2 - 40, w: 10, h: 80, dy: 0 };
let p2 = { x: canvas.width - 30, y: canvas.height / 2 - 40, w: 10, h: 80, dy: 0 };
let ball = { x: 0, y: 0, r: 8, dx: 0, dy: 0 };
serveBall(Math.random() < 0.5 ? 1 : -1);

document.addEventListener("keydown", e => {
  if (e.key === "ArrowUp") p2.dy = -6;
  if (e.key === "ArrowDown") p2.dy =  6;

  if (e.key === "w") p1.dy = -6;
  if (e.key === "s") p1.dy =  6;
});

document.addEventListener("keyup", e => {
  if (["ArrowUp","ArrowDown"].includes(e.key)) p2.dy = 0;
  if (["w","s"].includes(e.key)) p1.dy = 0;
});

function serveBall(direction = 1) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;

  const speed = 4;
  const angle = (Math.random() * Math.PI / 3) - Math.PI / 6; // -30° to +30°

  ball.dx = direction * speed * Math.cos(angle);
  ball.dy = speed * Math.sin(angle);
}


function update() {
  // Move paddles
  p1.y += p1.dy;
  p2.y += p2.dy;

  // Clamp paddles inside screen
  p1.y = Math.max(0, Math.min(canvas.height - p1.h, p1.y));
  p2.y = Math.max(0, Math.min(canvas.height - p2.h, p2.y));

  // Move ball
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

  let serving = false;


  // Reset if ball passes left or right
if (ball.x < 0 || ball.x > canvas.width) {
  serving = true;
  ball.dx = 0;
  ball.dy = 0;

  setTimeout(() => {
    const dir = ball.x < 0 ? 1 : -1; // serve toward scoring player
    serveBall(dir);
    serving = false;
  }, 700);
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
