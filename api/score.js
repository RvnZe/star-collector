import fetch from "node-fetch";

const BIN_ID = process.env.JSONBIN_BIN_ID;
const WRITE_KEY = process.env.JSONBIN_WRITE_KEY;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { name, score } = req.body;

    const latest = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { "X-Master-Key": WRITE_KEY }
    });
    const data = await latest.json();
    const scores = data.record.scores || [];
    scores.push({ name, score });
    scores.sort((a, b) => b.score - a.score);
    const topScores = scores.slice(0, 10);

    // Update bin
    await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": WRITE_KEY
      },
      body: JSON.stringify({ scores: topScores })
    });

    res.status(200).json({ leaderboard: topScores });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save score" });
  }
}
