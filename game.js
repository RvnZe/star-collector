const API_BASE = "/api"; // serverless proxy

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const player = { x: 150, y: 400, size: 25, speed: 6, dx: 0 };
const stars = [];
const enemies = [];
let score = 0;
let level = 1;
let frame = 0;
let levelThreshold = 100;
let spawnRate = 60;
let playerName = "Player";

let gameRunning = false;

// Input handling
const keys = {};
document.addEventListener("keydown", e => { keys[e.key] = true; });
document.addEventListener("keyup", e => { keys[e.key] = false; });

// Leaderboard
export async function loadLeaderboard() {
  try {
    const res = await fetch(`${API_BASE}/leaderboard`);
    if(!res.ok) throw new Error("Fetch leaderboard failed");
    const data = await res.json();
    renderLeaderboard(data.leaderboard || []);
    return data.leaderboard || [];
  } catch(err) { console.error(err); return []; }
}

export async function saveScore(name, score) {
  try {
    const res = await fetch(`${API_BASE}/score`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ name, score })
    });
    if(!res.ok) throw new Error("Save score failed");
    const json = await res.json();
    renderLeaderboard(json.leaderboard || []);
    return json;
  } catch(err){ console.error(err); return null; }
}

function renderLeaderboard(scores){
  const tbody = document.querySelector("#board tbody");
  tbody.innerHTML = "";
  scores.forEach((s,i)=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${i+1}</td><td>${s.name}</td><td>${s.score}</td>`;
    tbody.appendChild(tr);
  });
}

// Spawn helpers
function spawnStar(){ stars.push({ x: Math.random()*(canvas.width-15), y:0, size:10 }); }
function spawnEnemy(){ enemies.push({ x: Math.random()*(canvas.width-25), y:0, size:20 }); }

// Game loop
function update(){
  if(!gameRunning) return;

  frame++;
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Player movement
  if(keys["ArrowLeft"]) player.x -= player.speed;
  if(keys["ArrowRight"]) player.x += player.speed;
  player.x = Math.max(0, Math.min(player.x, canvas.width - player.size));

  // Draw player
  ctx.fillStyle = "#ffd166";
  ctx.fillRect(player.x,player.y,player.size,player.size);

  // Stars
  if(frame % 35 === 0) spawnStar();
  for(let s of [...stars]){
    s.y += 2 + level*0.2;
    ctx.fillStyle = "#16a34a";
    ctx.beginPath();
    ctx.arc(s.x,s.y,s.size,0,Math.PI*2);
    ctx.fill();
    if(Math.abs(s.x-player.x)<player.size && Math.abs(s.y-player.y)<player.size){
      score +=10;
      stars.splice(stars.indexOf(s),1);
    } else if(s.y > canvas.height) stars.splice(stars.indexOf(s),1);
  }

  // Enemies
  if(frame % spawnRate === 0) spawnEnemy();
  for(let e of [...enemies]){
    e.y += 3 + level*0.3;
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(e.x,e.y,e.size,e.size);
    if(Math.abs(e.x-player.x)<player.size && Math.abs(e.y-player.y)<player.size){
      endGame();
    } else if(e.y > canvas.height) enemies.splice(enemies.indexOf(e),1);
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

// End game overlay
function endGame(){
  gameRunning = false;
  document.getElementById("gameCanvas").style.opacity = "0.5";
  document.getElementById("hud").innerHTML += " | GAME OVER!";
  saveScore(playerName, score);
  score = 0; level = 1; enemies.length=0; stars.length=0; levelThreshold=100; spawnRate=60;
}

// Start game
export function startGame(){
  gameRunning = true;
  document.getElementById("gameCanvas").style.opacity = "1";
  update();
}

// Set player name
export function setPlayerName(name){ playerName = name; }
