import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {newGame,advance,choose} from '../src/domain/engine.mjs';
import {sceneArt,actionTiles} from '../src/domain/presentation.mjs';
import {moodFor} from '../src/domain/music.mjs';
const story=JSON.parse(fs.readFileSync(new URL('../src/data/story.json',import.meta.url),'utf8'));
function play(decisions={}){const s=newGame(story);for(let i=0;i<1500&&s.phase!=='completed';i++){if(s.phase==='choosing')choose(story,s,decisions[s.nodeId]??'A');else advance(story,s);}assert.equal(s.phase,'completed');return s;}

test('Every route experiences the six everyday scenes before the confession',()=>{
 for(const decisions of [{},{S08:'C',B01:'B'},{S14:'C'}]){
  const s=play(decisions),at=id=>s.visits.indexOf(id);
  assert.ok(at('S02')<at('S15')&&at('S15')<at('S03'));
  assert.ok(at('S05')<at('S16')&&at('S16')<at('S17')&&at('S17')<at('S06'));
  assert.ok(at('S06')<at('S18')&&at('S18')<at('S19')&&at('S19')<at('S07'));
  assert.ok(at('S07')<at('S20')&&at('S20')<at('S08'));
 }
});
test('Buying and sharing ice cream use distinct actual illustrations, and a hug changes its shot',()=>{
 assert.notEqual(story.nodes.S16.backgroundId,story.nodes.S17.backgroundId);
 const s=play();
 const hug=story.nodes.S10.choices.find(c=>c.id==='A').response.find(b=>b.kind==='action'&&b.art==='airport-hug');
 assert.ok(hug);
 const preview={...s,nodeId:'S10',phase:'response',queue:[hug],index:0};
 assert.equal(sceneArt(story.nodes.S10,preview).storyboard,true);
 for(const node of Object.values(story.nodes))for(const beat of [...node.beats,...node.choices.flatMap(c=>c.response)])if(beat.art)assert.ok(actionTiles[beat.art]);
});
test('All scenes include inner or narrative detail, and friendship never borrows a lovers hug',()=>{
 for(const node of Object.values(story.nodes))assert.ok(node.beats.some(b=>['thought','narration'].includes(b.kind)),node.id);
 assert.ok(story.nodes.S17.beats.some(b=>b.kind==='thought'&&b.speaker==='小梦'));
 const friends=play({S08:'C',B01:'B'});
 assert.ok(!friends.history.some(b=>['airport-hug','bridge-hug','university-reunion','school-handhold'].includes(b.art)));
});
test('Five bundled music pieces contain real distinct PCM audio and the font is local',()=>{
 const hashes=new Set();
 for(const name of ['sunny','flutter','tender','distance','rain']){
  const data=fs.readFileSync(new URL(`../public/audio/${name}.wav`,import.meta.url));
  assert.equal(data.toString('ascii',0,4),'RIFF');assert.equal(data.readUInt32LE(24),22050);
  assert.ok(data.length>700000);hashes.add(crypto.createHash('sha256').update(data).digest('hex'));
  let energy=0;for(let i=44;i<data.length;i+=200)energy+=Math.abs(data.readInt16LE(i));assert.ok(energy>100000);
 }
 assert.equal(hashes.size,5);
 const font=fs.readFileSync(new URL('../public/fonts/ZCOOLKuaiLe-Regular.ttf',import.meta.url));
 assert.ok(font.length>1000000);assert.equal(font.readUInt32BE(0),0x00010000);
});

test('Touching, purchasing, sharing and leaning are drawn only after their action begins',()=>{
 for(const id of ['S15','S16','S17','S19']){
  const node=story.nodes[id],state={facts:{era:'high'},phase:'dialogue',decisions:{},queue:node.beats,index:0};
  const before=sceneArt(node,state);assert.equal(before.storyboard,true);
  let queue=node.beats,index=queue.findIndex(b=>b.art);
  if(index<0){queue=node.choices[0].response;index=queue.findIndex(b=>b.art);}
  assert.ok(index>=0,id+' needs an authored action cue');
  const after=sceneArt(node,{...state,phase:'response',queue,index});
  assert.notEqual(after.id,before.id);assert.ok(after.url!==before.url||after.position!==before.position);
 }
});

test('Music follows awkward happiness, disappointment, comfort and branch-specific distance',()=>{
 assert.equal(moodFor({id:'S17'}),'flutter');assert.equal(moodFor({id:'S16'}),'sunny');
 assert.equal(moodFor({id:'S05'},{phase:'dialogue'}),'rain');
 assert.equal(moodFor({id:'S05'},{phase:'response',decisions:{S05:'A'}}),'tender');
 assert.equal(moodFor({id:'S13'},{phase:'response',decisions:{S13:'B'}}),'distance');
 assert.equal(moodFor({id:'B11'},{phase:'response',decisions:{B11:'B'}}),'rain');
 assert.equal(moodFor({id:'E01'}),'tender');
});
