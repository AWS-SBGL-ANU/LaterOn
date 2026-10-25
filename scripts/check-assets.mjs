import fs from 'node:fs/promises';
import { tiles, actionTiles, backgroundArt, sketchSheets } from '../src/domain/presentation.mjs';
import {artStyle} from '../src/data/artStyle.mjs';
const sheets=sketchSheets;
for(const name of sheets){const path=`public/${artStyle.sheetDirectory}${name}.png`;const data=await fs.readFile(path);if(data.toString('hex',0,8)!=='89504e470d0a1a0a')throw Error('Invalid PNG '+path);const width=data.readUInt32BE(16),height=data.readUInt32BE(20);if(width<1200||height<700||Math.abs(width/height-16/9)>.025)throw Error('Invalid 3 by 3 landscape sheet '+path);console.log(`${name}: ${width} × ${height}`);}
for(const path of ['public/models/hand_landmarker.task','public/mediapipe/hand-tracking-worker.js','public/mediapipe/wasm/vision_wasm_internal.wasm']){if(!(await fs.stat(path)).size)throw Error('Empty hand tracking asset '+path);}
const story=JSON.parse(await fs.readFile('src/data/story.json','utf8'));
const boards=JSON.parse(await fs.readFile('src/data/storyboards.json','utf8'));
if(Object.keys(boards.nodes).length!==Object.keys(story.nodes).length)throw Error('Incomplete full-story illustration coverage');
for(const sheet of boards.sheets){
 const path=`public/${boards.directory}${sheet}.png`,data=await fs.readFile(path);
 if(data.toString('hex',0,8)!=='89504e470d0a1a0a'||data.readUInt32BE(16)<1200||data.readUInt32BE(20)<700||Math.abs(data.readUInt32BE(16)/data.readUInt32BE(20)-16/9)>.025)throw Error('Invalid story illustration sheet '+path);
}
for(const shot of Object.values(boards.shots))if(!boards.sheets.includes(shot.sheet)||!Number.isInteger(shot.index)||shot.index<0||shot.index>8||shot.beats.length>3)throw Error('Invalid full-story shot '+shot.id);
const cover=await fs.readFile(`public/${artStyle.cover}`);
if(cover.toString('hex',0,8)!=='89504e470d0a1a0a'||Math.abs(cover.readUInt32BE(16)/cover.readUInt32BE(20)-16/9)>.025)throw Error('Missing single landscape cover');

for(const node of Object.values(story.nodes))for(const era of ['high','university','adult']){
 const art=backgroundArt(node,{era});
 if(!sheets.includes(art.sheet)||!Number.isInteger(art.index)||art.index<0||art.index>8||art.size!=='300% 300%'||art.boySide!=='right')throw Error('Invalid scene binding '+node.id);
}
for(const [key,[sheet,index]] of Object.entries(actionTiles))if(!sheets.includes(sheet)||!Number.isInteger(index)||index<0||index>8)throw Error('Invalid action shot '+key);
for(const node of Object.values(story.nodes))for(const beat of [...node.beats,...node.choices.flatMap(c=>c.response)])if(beat.art&&!actionTiles[beat.art])throw Error('Unknown action '+beat.art);
if(Object.keys(tiles).length!==35)throw Error('Expected 35 scene/age variants');
for(const mood of ['sunny','flutter','tender','distance','rain']){
 const data=await fs.readFile(`public/audio/${mood}.wav`);if(data.toString('ascii',0,4)!=='RIFF'||data.length<500000)throw Error('Invalid music '+mood);
}
if((await fs.stat('public/fonts/ZCOOLKuaiLe-Regular.ttf')).size<100000)throw Error('Missing cartoon Chinese font');
console.log(`${Object.keys(boards.shots).length} static illustrations across ${boards.sheets.length} new sheets, every story binding, five music tracks and the Chinese font verified.`);
