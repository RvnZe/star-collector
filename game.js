import dotenv from "dotenv";
dotenv.config();

const BIN_ID = process.env.JSONBIN_BIN_ID;
const API_KEY = process.env.JSONBIN_API_KEY;
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

export async function loadLeaderboard() {
  const res = await fetch(API_URL, {
    headers: { "X-Master-Key": API_KEY }
  });
  const data = await res.json();
  return data.record.leaderboard || [];
}

export async function saveScore(name, score) {
  const scores = await loadLeaderboard();
  scores.push({ name, score, time: Date.now() });
  scores.sort((a, b) => b.score - a.score);
  const top10 = scores.slice(0, 10);

  await fetch(API_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY
    },
    body: JSON.stringify({ leaderboard: top10 })
  });

  return top10;
}
