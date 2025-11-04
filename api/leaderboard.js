import fetch from "node-fetch";

export default async function handler(req,res){
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if(req.method==="OPTIONS") return res.status(200).end();

  try{
    const BIN_ID = process.env.JSONBIN_BIN_ID;
    const API_KEY = process.env.JSONBIN_API_KEY; // read-only or master
    const url = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
    const r = await fetch(url,{ headers:{"X-Master-Key":API_KEY} });
    const json = await r.json();
    res.status(200).json({ leaderboard: json.record?.leaderboard||[] });
  }catch(err){
    console.error(err);
    res.status(500).json({ error:"Server error" });
  }
}
