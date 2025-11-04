import fetch from "node-fetch";

export default async function handler(req,res){
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if(req.method==="OPTIONS") return res.status(200).end();

  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});

  try{
    const { name, score } = req.body;
    if(!name || typeof score!=="number") return res.status(400).json({error:"Invalid payload"});

    const BIN_ID = process.env.JSONBIN_BIN_ID;
    const API_KEY = process.env.JSONBIN_WRITE_KEY;
    const url = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

    const rGet = await fetch(url,{ headers:{"X-Master-Key":API_KEY} });
    const json = await rGet.json();
    const scores = json.record?.leaderboard || [];

    scores.push({name,score,time:Date.now()});
    scores.sort((a,b)=>b.score-a.score);
    const top = scores.slice(0,10);

    const rPut = await fetch(url,{
      method:"PUT",
      headers:{"Content-Type":"application/json","X-Master-Key":API_KEY},
      body: JSON.stringify({ leaderboard: top })
    });

    if(!rPut.ok){
      const text = await rPut.text();
      return res.status(rPut.status).send(text);
    }

    res.status(200).json({ success:true, leaderboard: top });
  }catch(err){
    console.error(err);
    res.status(500).json({ error:"Server error" });
  }
}
