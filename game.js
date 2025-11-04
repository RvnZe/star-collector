// ====== CONFIG ======
const API_BASE = "/api"; // proxy serverless

// ====== GAME SETUP ======
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const player = { x: 150, y: 400, size: 20, speed: 5 };
const stars = [];
const enemies = [];
let score = 0;
let level = 1;
let frame = 0;
let levelThreshold = 100;
let spawnRate = 60;
let playerName = prompt("Masukkan nama Anda:", "Player");

// ====== INPUT ======
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && player.x > 0) player.x -= player.speed;
  if (e.key === "ArrowRight" && player.x < canvas.width - player.size) player.x += player.speed;
});

// ====== LEADERBOARD ======
export async function loadLeaderboard() {
  try {
    const res = await fetch(`${API_BASE}/leaderboard`);
    if (!res.ok) throw new Error("Fetch leaderboard failed");
    const data = await res.json();
    const scores = data.leaderboard || [];
    renderLeaderboard(scores);
    return scores;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function saveScore(name, score) {
  try {
    const res = await fetch(`${API_BASE}/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, score })
    });
    if (!res.ok) throw new Error("Save score failed");
    const json = await res.json();
    renderLeaderboard(json.leaderboard || []);
    return json;
  } catch (err) {
    console.error(err);
    return null;
  }
}

function renderLeaderboard(scores) {
  const tbody = document.querySelector("#board tbody");
  tbody.innerHTML = "";
  scores.forEach((s, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${i+1}</td><td>${s.name}</td><td>${s.score}</td>`;
    tbody.appendChild(tr);
  });
}

// ====== GAME LOGIC ======
function spawnStar() { stars.push({ x: Math.random()*(canvas.width-10), y:0, size:10 }); }
function spawnEnemy() { enemies.push({ x: Math.random()*(canvas.width-20), y:0, size:20 }); }

function update() {
  frame++;
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Player
  ctx.fillStyle = "#ffd166";
  ctx.fillRect(player.x, player.y, player.size, player.size);

  // Stars
  if(frame % 40 === 0) spawnStar();
  for(let s of stars){
    s.y += 2;
    ctx.fillStyle = "#16a34a";
    ctx.beginPath();
    ctx.arc(s.x,s.y,s.size,0,Math.PI*2);
    ctx.fill();
    if(Math.abs(s.x-player.x)<20 && Math.abs(s.y-player.y)<20){
      score +=10;
      stars.splice(stars.indexOf(s),1);
    }
  }

  // Enemies
  if(frame % spawnRate === 0) spawnEnemy();
  for(let e of enemies){
    e.y += 3 + level;
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(e.x,e.y,e.size,e.size);
    if(Math.abs(e.x-player.x)<20 && Math.abs(e.y-player.y)<20){
      alert(`Game Over! Skor Anda: ${score}`);
      saveScore(playerName,score);
      score=0; level=1; enemies.length=0; stars.length=0; levelThreshold=100; spawnRate=60;
    }
  }

  // Level up
  if(score >= levelThreshold){
    level++;
    levelThreshold += 100;
    spawnRate = Math.max(20, spawnRate-5);
  }

  // HUD
  document.getElementById("score").innerText = score;
  document.getElementById("level").innerText = level;

  requestAnimationFrame(update);
}

// ====== START GAME ======
export function startGame() {
  loadLeaderboard();
  update();
}
