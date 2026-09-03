const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("high-score");
const message = document.getElementById("game-message");
const startButton = document.getElementById("start-button");

const gridSize = 20;
const cellSize = canvas.width / gridSize;
let snake, food, direction, nextDirection, score, speed, timer, isRunning, isGameOver;
let highScore = Number(localStorage.getItem("snake-high-score")) || 0;

highScoreElement.textContent = String(highScore).padStart(3, "0");

function resetGame() {
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  direction = { x: 1, y: 0 };
  nextDirection = direction;
  score = 0;
  speed = 145;
  isRunning = false;
  isGameOver = false;
  food = createFood();
  scoreElement.textContent = "000";
  draw();
}

function createFood() {
  let position;
  do { position = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) }; }
  while (snake.some(segment => segment.x === position.x && segment.y === position.y));
  return position;
}

function startGame() {
  if (isRunning) return;
  isRunning = true;
  message.classList.add("hidden");
  clearInterval(timer);
  timer = setInterval(move, speed);
}

function move() {
  direction = nextDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  const hitWall = head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize;
  const hitSelf = snake.some(segment => segment.x === head.x && segment.y === head.y);
  if (hitWall || hitSelf) return endGame();
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreElement.textContent = String(score).padStart(3, "0");
    food = createFood();
    if (score > highScore) { highScore = score; localStorage.setItem("snake-high-score", highScore); highScoreElement.textContent = String(highScore).padStart(3, "0"); }
    speed = Math.max(65, speed - 5);
    clearInterval(timer); timer = setInterval(move, speed);
  } else snake.pop();
  draw();
}

function endGame() {
  clearInterval(timer); isRunning = false; isGameOver = true;
  message.querySelector(".message-kicker").textContent = "FIN DE PARTIE";
  message.querySelector("h2").textContent = `${score} points !`;
  message.querySelector("p:not(.message-kicker)").textContent = "Une autre promenade dans le jardin ?";
  startButton.textContent = "Rejouer";
  message.classList.remove("hidden");
}

function draw() {
  context.fillStyle = "#b8e5b8"; context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "rgba(27,36,48,.10)"; context.lineWidth = 1;
  for (let i = 0; i <= gridSize; i++) { context.beginPath(); context.moveTo(i * cellSize, 0); context.lineTo(i * cellSize, canvas.height); context.stroke(); context.beginPath(); context.moveTo(0, i * cellSize); context.lineTo(canvas.width, i * cellSize); context.stroke(); }
  context.fillStyle = "#ff6c8c"; context.beginPath(); context.arc((food.x + .5) * cellSize, (food.y + .5) * cellSize, cellSize * .3, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#1b2430"; context.fillRect((food.x + .5) * cellSize, (food.y + .1) * cellSize, 3, 10);
  snake.forEach((segment, index) => { context.fillStyle = index === 0 ? "#b8f04d" : "#42785b"; context.fillRect(segment.x * cellSize + 2, segment.y * cellSize + 2, cellSize - 4, cellSize - 4); });
  const head = snake[0]; context.fillStyle = "#1b2430"; context.fillRect((head.x + .68) * cellSize, (head.y + .25) * cellSize, 4, 4);
}

function setDirection(name) {
  const directions = { up:{x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0} };
  const candidate = directions[name];
  if (isGameOver) resetGame();
  if (!candidate || candidate.x === -direction.x || candidate.y === -direction.y) return;
  nextDirection = candidate; startGame();
}

document.addEventListener("keydown", event => { const keys = { ArrowUp:"up", z:"up", w:"up", ArrowDown:"down", s:"down", ArrowLeft:"left", q:"left", a:"left", ArrowRight:"right", d:"right" }; const name = keys[event.key]; if (name) { event.preventDefault(); setDirection(name); } });
document.querySelectorAll("[data-direction]").forEach(button => button.addEventListener("click", () => setDirection(button.dataset.direction)));
startButton.addEventListener("click", () => { if (!isRunning) { resetGame(); startGame(); } });
resetGame();
