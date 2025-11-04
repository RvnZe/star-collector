import fetch from "node-fetch";

const BIN_ID = process.env.JSONBIN_BIN_ID;
const API_KEY = process.env.JSONBIN_API_KEY || "";

export default async function handler(req,res){
  const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
    headers:{ "X-Master-Key": API_KEY }
  });
  const data = await response.json();
  res.json({ leaderboard: data.record.scores || [] });
}
