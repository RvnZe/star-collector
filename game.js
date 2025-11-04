// game.js
import dotenv from "dotenv";
dotenv.config();

// Ambil dari environment (.env lokal atau GitHub Actions)
const BIN_ID = process.env.JSONBIN_BIN_ID;
const API_KEY = process.env.JSONBIN_API_KEY;
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// ====== Game Setup ======
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

// ====== Event Listener ======
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && player.x > 0) player.x -= player.speed;
  if (e.key === "ArrowRight" && player.x < canvas.width - player.size) player.x += player.speed;
});

// ====== JSONBin Functions ======
export async function loadLeaderboard() {
  try {
    const res = await fetch(API_URL, { headers: { "X-Master-Key": API_KEY } });
    const data = await res.json();
    const scores = data.record.leaderboard || [];
    renderLeaderboard(scores);
    return scores;
  } catch (err) {
    console.error("Gagal memuat leaderboard:", err);
    return [];
  }
}

export async function saveScore(name, score) {
  try {
    let scores = await loadLeaderboard();
    scores.push({ name, score, time: Date.now() });
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 10); // Top 10

    await fetch(API_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY
      },
      body: JSON.stringify({ leaderboard: scores })
    });

    renderLeaderboard(scores);
  } catch (err) {
    console.error("Gagal menyimpan skor:", err);
  }
}

function renderLeaderboard(scores) {
  const tbody = document.querySelector("#board tbody");
  tbody.innerHTML = "";
  scores.forEach((s, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${i + 1}</td><td>${s.name}</td><td>${s.score}</td>`;
    tbody.appendChild(tr);
  });
}

// ====== Game Logic ======
function spawnStar() {
  stars.push({ x: Math.random() * (canvas.width - 10), y: 0, size: 10 });
}

function spawnEnemy() {
  enemies.push({ x: Math.random() * (canvas.width - 20), y: 0, size: 20 });
}

function update() {
  frame++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // --- Player ---
  ctx.fillStyle = "#ffd166";
  ctx.fillRect(player.x, player.y, player.size, player.size);

  // --- Stars ---
  if (frame % 40 === 0) spawnStar();
  for (let s of stars) {
    s.y += 2;
    ctx.fillStyle = "#16a34a";
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();

    // Collision player <-> star
    if (Math.abs(s.x - player.x) < 20 && Math.abs(s.y - player.y) < 20) {
      score += 10;
      stars.splice(stars.indexOf(s), 1);
    }
  }

  // --- Enemies ---
  if (frame % spawnRate === 0) spawnEnemy();
  for (let e of enemies) {
    e.y += 3 + level;
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(e.x, e.y, e.size, e.size);

    // Collision player <-> enemy
    if (Math.abs(e.x - player.x) < 20 && Math.abs(e.y - player.y) < 20) {
      alert(`Game Over! Skor Anda: ${score}`);
      saveScore(playerName, score);
      score = 0;
      level = 1;
      enemies.length = 0;
      stars.length = 0;
      levelThreshold = 100;
      spawnRate = 60;
    }
  }

  // --- Level Up ---
  if (score >= levelThreshold) {
    level++;
    levelThreshold += 100;
    spawnRate = Math.max(20, spawnRate - 5);
  }

  // --- Update HUD ---
  document.getElementById("score").innerText = score;
  document.getElementById("level").innerText = level;

  requestAnimationFrame(update);
}

// ====== Start Game ======
export function startGame() {
  loadLeaderboard();
  update();
}
