// build.js
import fs from "fs";
import { copyFileSync } from "fs";

if (!fs.existsSync("dist")) fs.mkdirSync("dist");
copyFileSync("index.html", "dist/index.html");
copyFileSync("game.js", "dist/game.js");
console.log("Build complete");
