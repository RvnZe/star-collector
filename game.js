// game.js
const API_BASE = "/api"; // serverless proxy

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const player = { x: 150, y: 400, size: 25, speed: 6, glow: 0 };
const stars = [];
const enemies = [];
const particles = [];
let score = 0;
let level = 1;
let frame = 0;
let levelThreshold = 100;
let spawnRate = 60;
let playerName = "Player";
let gameRunning = false;

const keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

const gameOverOverlay = document.getElementById("gameOverOverlay");
const finalScoreEl = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");

// Sound effects
const sfxStar = new Audio("assets/star.wav");
const sfxGameOver = new Audio("assets/gameover.wav");
const sfxLevelUp = new Audio("assets/levelup.wav");

// Leaderboard
export async function loadLeaderboard() {
  try{
    const res = await fetch(`${API_BASE}/leaderboard`);
    if(!res.ok) throw new Error("Fetch leaderboard failed");
    const data = await res.json();
    renderLeaderboard(data.leaderboard || []);
    return data.leaderboard || [];
  } catch(e){ console.error(e); return []; }
}

export async function saveScore(name, score){
  try{
    const res = await fetch(`${API_BASE}/score`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({name,score})
    });
    if(!res.ok) throw new Error("Save score failed");
    const data = await res.json();
    renderLeaderboard(data.leaderboard || []);
    return data;
  } catch(e){ console.error(e); return null; }
}

function renderLeaderboard(scores){
  const tbody=document.querySelector("#board tbody");
  tbody.innerHTML="";
  scores.forEach((s,i)=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${i+1}</td><td>${s.name}</td><td>${s.score}</td>`;
    tbody.appendChild(tr);
  });
}

// Spawn helpers
function spawnStar(){
  stars.push({
    x:Math.random()*(canvas.width-15),
    y:0,
    size:10,
    flicker:Math.random(),
    sway:Math.random()*2-1
  });
}
function spawnEnemy(){ enemies.push({ x:Math.random()*(canvas.width-25), y:0, size:20 }); }
function spawnParticles(x,y){
  for(let i=0;i<10;i++){
    particles.push({
      x,y,
      vx:(Math.random()-0.5)*2,
      vy:-Math.random()*2-1,
      alpha:1,
      size:Math.random()*3+2,
      color:`rgba(250,230,50,1)`
    });
  }
}

function updateParticles(){
  for(let p of [...particles]){
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.03;
    ctx.fillStyle = `rgba(250,230,50,${p.alpha})`;
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
    ctx.fill();
    if(p.alpha<=0) particles.splice(particles.indexOf(p),1);
  }
}

let bgOffset = 0;
function drawBackground(){
  bgOffset += 0.2;
  const grad = ctx.createLinearGradient(0,bgOffset,0,canvas.height+bgOffset);
  grad.addColorStop(0,'#1e293b');
  grad.addColorStop(1,'#0f172a');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // Optional: small moving stars in background
  for(let i=0;i<20;i++){
    const bx = (i*50 + frame*0.3)%canvas.width;
    const by = (i*30 + frame*0.3)%canvas.height;
    ctx.fillStyle='rgba(255,255,255,0.05)';
    ctx.fillRect(bx,by,2,2);
  }
}

// Game loop
function update(){
  if(!gameRunning) return;
  frame++;
  drawBackground();

  // Player movement
  if(keys["ArrowLeft"]) player.x -= player.speed;
  if(keys["ArrowRight"]) player.x += player.speed;
  player.x = Math.max(0, Math.min(player.x, canvas.width-player.size));

  // Draw player
  ctx.fillStyle="#ffd166";
  ctx.shadowColor="#fbbf24";
  ctx.shadowBlur = player.glow;
  ctx.fillRect(player.x,player.y,player.size,player.size);
  ctx.shadowBlur = 0;
  if(player.glow>0) player.glow -= 0.5;

  // Stars
  if(frame % 35 === 0) spawnStar();
  for(let s of [...stars]){
    s.y += 2 + level*0.2;
    s.x += s.sway;
    ctx.fillStyle=`rgba(21,163,84,${0.5+0.5*Math.sin(s.flicker*frame*0.1)})`;
    ctx.beginPath();
    ctx.arc(s.x,s.y,s.size,0,Math.PI*2);
    ctx.fill();

    if(Math.abs(s.x-player.x)<player.size && Math.abs(s.y-player.y)<player.size){
      score += 10;
      stars.splice(stars.indexOf(s),1);
      player.glow = 15;
      spawnParticles(player.x+player.size/2,player.y+player.size/2);
      sfxStar.volume=0.2; sfxStar.play();
    } else if(s.y>canvas.height) stars.splice(stars.indexOf(s),1);
  }

  // Enemies
  if(frame % spawnRate === 0) spawnEnemy();
  for(let e of [...enemies]){
    e.y += 3 + level*0.3;
    ctx.fillStyle="#ef4444";
    ctx.fillRect(e.x,e.y,e.size,e.size);
    if(Math.abs(e.x-player.x)<player.size && Math.abs(e.y-player.y)<player.size){
      endGame();
    } else if(e.y>canvas.height) enemies.splice(enemies.indexOf(e),1);
  }

  // Level up
  if(score >= levelThreshold){
    level++;
    levelThreshold += 100;
    spawnRate = Math.max(20,spawnRate-5);
    sfxLevelUp.volume=0.2; sfxLevelUp.play();
  }

  // Update particles
  updateParticles();

  // HUD
  document.getElementById("score").innerText = score;
  document.getElementById("level").innerText = level;
  document.getElementById("levelProgress").style.width = Math.min(100,(score/levelThreshold)*100)+"%";

  requestAnimationFrame(update);
}

// End game
function endGame(){
  gameRunning=false;
  finalScoreEl.innerText=score;
  gameOverOverlay.style.display="flex";
  sfxGameOver.volume=0.3; sfxGameOver.play();
  saveScore(playerName,score);
}

// Restart
restartBtn.addEventListener("click",()=>{
  gameOverOverlay.style.display="none";
  score=0; level=1; frame=0; levelThreshold=100; spawnRate=60;
  enemies.length=0; stars.length=0; particles.length=0;
  player.glow=0;
  document.getElementById("score").innerText=score;
  document.getElementById("level").innerText=level;
  gameRunning=true;
  update();
});

// Start & set player
export function startGame(){ gameRunning=true; update(); }
export function setPlayerName(name){ playerName=name; }
