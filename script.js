const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const targetEl = document.getElementById('targetFruit');
const roundEl = document.getElementById('round');
const timerEl = document.getElementById('timer');
const startOverlay = document.getElementById('startOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const roundOverlay = document.getElementById('roundOverlay');
const roundMessage = document.getElementById('roundMessage');
const finalScoreEl = document.getElementById('finalScore');
const soundButton = document.getElementById('soundButton');

const fruits = [
  { type: 'apple', name: 'Maçã', emoji: '🍎', color: '#ed4b4b' },
  { type: 'banana', name: 'Banana', emoji: '🍌', color: '#ffd84d' },
  { type: 'grape', name: 'Uva', emoji: '🍇', color: '#8c55c7' },
  { type: 'orange', name: 'Laranja', emoji: '🍊', color: '#ff963d' },
  { type: 'watermelon', name: 'Melancia', emoji: '🍉', color: '#f35d74' }
];

let target = fruits[0], falling = [], score = 0, lives = 5, round = 1, roundTime = 60, playing = false, soundOn = true;
let lastTime = 0, spawnTimer = 0, difficulty = 0, audioContext;
const basket = { x: canvas.width / 2, y: canvas.height - 48, width: 116, height: 45 };
const TOTAL_ROUNDS = 3;
const ROUND_DURATION = 60;
let transitionTimer = null;

function resetGame() {
  score = 0; round = 1; startRound();
}

function startRound() {
  if (transitionTimer) { clearTimeout(transitionTimer); transitionTimer = null; }
  lives = 5; roundTime = ROUND_DURATION; falling = []; difficulty = 0; spawnTimer = 0; playing = true;
  target = fruits[Math.floor(Math.random() * fruits.length)];
  startOverlay.classList.add('hidden'); gameOverOverlay.classList.add('hidden'); roundOverlay.classList.add('hidden'); updateHud();
  lastTime = performance.now(); requestAnimationFrame(loop);
}

function updateHud() {
  scoreEl.textContent = score;
  livesEl.textContent = '❤️'.repeat(lives) + '🖤'.repeat(5 - lives);
  targetEl.textContent = `${target.emoji} ${target.name}`;
  roundEl.textContent = `${round} / ${TOTAL_ROUNDS}`;
  const seconds = Math.max(0, Math.ceil(roundTime));
  timerEl.textContent = seconds >= 60 ? '01:00' : `00:${String(seconds).padStart(2, '0')}`;
}

function spawnFruit() {
  const targetChance = roundTime <= 40 ? .42 : .28;
  const fruit = Math.random() < targetChance ? target : fruits[Math.floor(Math.random() * fruits.length)];
  const size = 43 + Math.random() * 13;
  const speedBoost = roundTime <= 40 ? 1.55 : 1;
  falling.push({ fruit, x: size + Math.random() * (canvas.width - size * 2), y: -size, size, speed: (185 + Math.random() * 75 + difficulty * 18) * speedBoost, wobble: Math.random() * 6.28, rotation: (Math.random() - .5) * .25 });
}

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const isSunny = round === 2;
  const isNight = round === 3;
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  if (isNight) {
    gradient.addColorStop(0, '#111a4d'); gradient.addColorStop(1, '#38427f'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff5b8'; ctx.beginPath(); ctx.arc(canvas.width - 105, 80, 35, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d8ddff'; ctx.beginPath(); ctx.arc(canvas.width - 89, 69, 35, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffffcc';
    for (let i = 0; i < 22; i++) { const x = (i * 137 + 60) % canvas.width, y = 28 + (i * 47) % 250; ctx.beginPath(); ctx.arc(x, y, 1.5 + i % 3, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#345b62'; ctx.fillRect(0, canvas.height - 18, canvas.width, 18);
    ctx.fillStyle = '#263f4b'; ctx.fillRect(0, canvas.height - 18, canvas.width, 5);
  } else if (isSunny) {
    gradient.addColorStop(0, '#48bde8'); gradient.addColorStop(.65, '#a8e8ff'); gradient.addColorStop(1, '#e6f8ff'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffe06b'; ctx.beginPath(); ctx.arc(canvas.width - 115, 78, 43, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff4a8aa'; ctx.lineWidth = 5;
    for (let i = 0; i < 8; i++) { const angle = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(canvas.width - 115 + Math.cos(angle) * 55, 78 + Math.sin(angle) * 55); ctx.lineTo(canvas.width - 115 + Math.cos(angle) * 70, 78 + Math.sin(angle) * 70); ctx.stroke(); }
    ctx.fillStyle = '#ffffffaa';
    for (let i = 0; i < 5; i++) { const x = 90 + i * 180, y = 90 + (i % 2) * 40; ctx.beginPath(); ctx.ellipse(x, y, 55, 13, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#72c878'; ctx.fillRect(0, canvas.height - 18, canvas.width, 18);
    ctx.fillStyle = '#48a85e'; ctx.fillRect(0, canvas.height - 18, canvas.width, 5);
  } else {
    gradient.addColorStop(0, '#9bdcf9'); gradient.addColorStop(1, '#d3f4ff'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff55';
    for (let i = 0; i < 9; i++) { const x = (i * 137 + 60) % canvas.width, y = 45 + (i % 3) * 100; ctx.beginPath(); ctx.arc(x, y, 3 + i % 3, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#83d491'; ctx.fillRect(0, canvas.height - 18, canvas.width, 18);
    ctx.fillStyle = '#58b872'; ctx.fillRect(0, canvas.height - 18, canvas.width, 5);
  }
  falling.forEach(drawFruit);
  drawBasket();
}

function drawFruit(item) {
  ctx.save(); ctx.translate(item.x, item.y); ctx.rotate(item.rotation);
  ctx.font = `${item.size}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = '#49779a66'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 5; ctx.fillText(item.fruit.emoji, 0, 0); ctx.restore();
}

function drawBasket() {
  ctx.save();
  ctx.translate(basket.x, basket.y);
  ctx.fillStyle = '#9a572f';
  ctx.strokeStyle = '#69351e';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(0, -6, 42, Math.PI, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-basket.width / 2, -12);
  ctx.lineTo(basket.width / 2, -12);
  ctx.lineTo(basket.width / 2 - 13, basket.height - 13);
  ctx.quadraticCurveTo(0, basket.height + 5, -basket.width / 2 + 13, basket.height - 13);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#d88a4d'; ctx.lineWidth = 4;
  for (let x = -42; x <= 42; x += 21) { ctx.beginPath(); ctx.moveTo(x, -10); ctx.lineTo(x * .78, 32); ctx.stroke(); }
  ctx.restore();
}

function moveBasket(clientX) {
  const rect = canvas.getBoundingClientRect();
  basket.x = Math.max(basket.width / 2, Math.min(canvas.width - basket.width / 2, (clientX - rect.left) * canvas.width / rect.width));
}

function loop(now) {
  if (!playing) return;
  const dt = Math.min((now - lastTime) / 1000, .05); lastTime = now; spawnTimer += dt; difficulty += dt / 55; roundTime -= dt;
  if (roundTime <= 0) { finishRound(); return; }
  updateHud();
  const interval = Math.max(.34, (1.05 - difficulty * .08) * (roundTime <= 40 ? .72 : 1));
  if (spawnTimer > interval) { spawnTimer = 0; spawnFruit(); if (Math.random() < Math.min(.25, difficulty * .025)) spawnFruit(); }
  falling.forEach(item => { item.y += item.speed * dt; item.x += Math.sin(now / 500 + item.wobble) * .18; });
  for (let i = falling.length - 1; i >= 0; i--) {
    const item = falling[i];
    const nearBasket = item.y + item.size * .35 >= basket.y - 10;
    const insideBasket = Math.abs(item.x - basket.x) < basket.width / 2 + item.size * .25;
    if (nearBasket && insideBasket) {
      if (item.fruit.type === target.type) { score += 10; beep(620, .08); updateHud(); }
      else loseLife();
      falling.splice(i, 1);
    } else if (item.y > canvas.height + 60) {
      // A fruta correta que cai sem ser capturada também custa uma vida.
      if (item.fruit.type === target.type) loseLife();
      falling.splice(i, 1);
    }
  }
  drawScene(); requestAnimationFrame(loop);
}

function loseLife() { lives--; updateHud(); beep(160, .13); if (lives <= 0) endGame(); }
function endGame() { playing = false; finalScoreEl.textContent = score; gameOverOverlay.classList.remove('hidden'); beep(110, .35); }

function finishRound() {
  playing = false; falling = []; roundTime = 0; updateHud(); beep(820, .18);
  if (round >= TOTAL_ROUNDS) { endGame(); return; }
  round += 1;
  roundMessage.textContent = `Rodada ${round} de ${TOTAL_ROUNDS}!`;
  roundOverlay.classList.remove('hidden');
  transitionTimer = setTimeout(startRound, 1800);
}

canvas.addEventListener('mousemove', event => moveBasket(event.clientX));
canvas.addEventListener('touchmove', event => { event.preventDefault(); moveBasket(event.touches[0].clientX); }, { passive: false });
document.getElementById('startButton').addEventListener('click', resetGame);
document.getElementById('restartButton').addEventListener('click', resetGame);
document.getElementById('nextRoundButton').addEventListener('click', startRound);
soundButton.addEventListener('click', () => { soundOn = !soundOn; soundButton.textContent = soundOn ? '🔊' : '🔇'; });

function beep(frequency, duration) {
  if (!soundOn) return;
  audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator(), gain = audioContext.createGain(); oscillator.frequency.value = frequency; oscillator.type = 'sine'; gain.gain.setValueAtTime(.045, audioContext.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration); oscillator.connect(gain).connect(audioContext.destination); oscillator.start(); oscillator.stop(audioContext.currentTime + duration);
}

drawScene(); updateHud();
