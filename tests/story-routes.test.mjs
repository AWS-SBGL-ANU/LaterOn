import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newGame,advance,choose,current,validateSave,matches} from '../src/domain/engine.mjs';
import {SaveRepository,SaveConflict} from '../src/services/saveRepository.mjs';
const story=JSON.parse(fs.readFileSync(new URL('../src/data/story.json',import.meta.url),'utf8'));
function play(decisions={}){const s=newGame(story);let safety=0;while(s.phase!=='completed'){assert.ok(safety++<1500,'route must terminate');if(s.phase==='choosing')assert.ok(choose(story,s,decisions[s.nodeId]??'A'));else assert.ok(advance(story,s));}return s;}
test('All five specified routes reach their expected ending',()=>{
 assert.equal(play().nodeId,'E01');
 const repaired=play({S09:'B',B03:'B',S12:'C',B06:'A',B07:'B',S13:'A',S14:'B',B09:'A',B10:'A',B11:'A'});assert.equal(repaired.nodeId,'E01');assert.ok(repaired.visits.includes('B11'));
 assert.equal(play({S09:'B',B03:'B',S12:'C',B06:'B',S13:'B',S14:'B',B09:'B'}).nodeId,'E02');
 const friends=play({S08:'C',B01:'B'});assert.equal(friends.nodeId,'E03');for(const id of ['S09','S10','S11','D01','D02'])assert.ok(!friends.visits.includes(id));
 assert.equal(play({S12:'B',S14:'C'}).nodeId,'E04');
});
test('Every possible branch terminates and all 39 nodes are reachable',()=>{
 const reached=new Set(),endings=new Set();let count=0;
 // Merge paths only when their future-relevant state and conditional dialogue memories match.
 const visited=new Set();const walk=s=>{
  while(s.phase==='dialogue'||s.phase==='response')advance(story,s);
  reached.add(s.nodeId);if(s.phase==='completed'){endings.add(s.nodeId);return;}
  const signature=JSON.stringify([s.nodeId,s.facts,s.decisions.S07,s.decisions.S08,s.decisions.F01,s.previous]);
  if(visited.has(signature))return;visited.add(signature);count++;
  for(const c of story.nodes[s.nodeId].choices){const next=structuredClone(s);choose(story,next,c.id);walk(next);}
 };walk(newGame(story));assert.equal(reached.size,39);assert.equal(endings.size,4);assert.ok(count>40);
});
test('A promised explanation occurs after the exam, and notebook memories are exclusive',()=>{
 const s=newGame(story);s.decisions.S07='B';assert.equal(matches('S07:B',s),true);
 const early=story.nodes.S08.beats.filter(b=>matches(b.when,s));assert.ok(early.some(b=>b.text.includes('我爸妈要分开')));
 for(const option of ['A','B','C']){const route=play({S02:option});const recalled=route.history.filter(b=>b.nodeId==='E01');assert.equal(recalled.filter(b=>b.when?.startsWith('S02:')).length,3);assert.ok(recalled.filter(b=>b.when?.startsWith('S02:')).every(b=>b.when===`S02:${option}`));}
});
test('Saving in a response restores without applying effects twice; terminal choices must be read',()=>{
 const s=newGame(story);while(s.phase!=='choosing')advance(story,s);choose(story,s,'B');advance(story,s);
 const loaded=validateSave(story,JSON.parse(JSON.stringify(s)));assert.deepEqual(loaded,s);assert.equal(current(loaded).text,current(s).text);assert.equal(choose(story,loaded,'A'),false);
 const finished=play();assert.equal(finished.phase,'completed');assert.ok(finished.history.at(-1).text.length>0);
 assert.throws(()=>validateSave(story,{...s,index:100}));assert.throws(()=>validateSave(story,{...s,storyVersion:'old'}));
});
test('Do not leak production annotations or conditional headers to the reader',()=>{
 for(const node of Object.values(story.nodes))for(const beat of [...node.beats,...node.tail,...node.choices.flatMap(x=>x.response)])assert.ok(!/【|【去向|可靠记录＝|透明问题＝|若仍有|若透明问题/.test(beat.text),beat.text);
 const b10=story.nodes.B10.choices[0];assert.equal(b10.response.filter(b=>b.when==='trusted').length,3);assert.equal(b10.response.filter(b=>b.when==='untrusted').length,3);
});
test('Independent tabs detect writes instead of overwriting; fork survives reload',()=>{
 const values=new Map(),storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 const a=new SaveRepository(storage,story);a.save(newGame(story));const b=new SaveRepository(storage,story);b.load();
 const s=a.load();advance(story,s);a.save(s);assert.throws(()=>b.save(newGame(story)),SaveConflict);
 b.fork();b.save(newGame(story));const c=new SaveRepository(storage,story);assert.equal(c.slot,b.slot);assert.equal(c.load().nodeId,'S01');
});
