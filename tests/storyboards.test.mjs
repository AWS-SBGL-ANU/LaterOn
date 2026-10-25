import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newGame,enter,advance,choose} from '../src/domain/engine.mjs';
import {sceneArt,artDependencies} from '../src/domain/presentation.mjs';
import {chapterCard,chapterPassages} from '../src/domain/chapterTransitions.mjs';
const story=JSON.parse(fs.readFileSync(new URL('../src/data/story.json',import.meta.url),'utf8'));
const boards=JSON.parse(fs.readFileSync(new URL('../src/data/storyboards.json',import.meta.url),'utf8'));
test('Every dialogue and all 105 response branches change actual illustration within three lines',()=>{
 let choices=0;
 const inspect=(node,state)=>{
  let last=null,count=0;
  while(state.nodeId===node.id&&['dialogue','response'].includes(state.phase)){
   const art=sceneArt(node,state);
   assert.equal(art.storyboard,true,`${node.id}:${state.queue[state.index].id}`);
   assert.deepEqual(artDependencies(art),[art.url]);
   if(art.key===last)count++;else {last=art.key;count=1;}
   assert.ok(count<=3,`${node.id}: ${art.key} lasts ${count} lines`);
   assert.equal(art.performance,undefined);
   advance(story,state);
  }
 };
 for(const node of Object.values(story.nodes)){
  const state=newGame(story);enter(story,state,node.id);inspect(node,state);
  for(const option of node.choices){
   const response=newGame(story);response.facts.plan=true;enter(story,response,node.id);
   while(response.phase==='dialogue')advance(story,response);
   choose(story,response,option.id);choices++;inspect(node,response);
  }
 }
 assert.equal(choices,105);
 assert.equal(Object.keys(boards.nodes).length,39);
 assert.equal(Object.keys(boards.shots).length,414);
});
test('Every authored action starts its own shot on that exact line',()=>{
 for(const node of Object.values(story.nodes)){
  const sequences=[['dialogue',node.beats],...node.choices.map(c=>[c.id,[...c.response,...node.tail]])];
  for(const [phase,beats] of sequences){
   const mapping=phase==='dialogue'?boards.nodes[node.id].dialogue:boards.nodes[node.id].responses[phase];
   for(const beat of beats.filter(b=>b.kind==='action')){
    const shot=boards.shots[mapping[beat.id]];
    assert.equal(shot.beats[0],beat.id,`${node.id}:${phase}:${beat.id} must not lag behind dialogue`);
   }
  }
 }
 const ear=boards.nodes.S01.responses.A['S01-r-0'];
 assert.equal(boards.shots[ear].beats[0],'S01-r-0');
 const fingers=boards.nodes.S15.dialogue['S15-d-8'];
 assert.equal(boards.shots[fingers].beats[0],'S15-d-8');
 const hug=boards.nodes.S10.responses.A['S10-r-9'];
 assert.notEqual(hug,boards.nodes.S10.responses.A['S10-r-0']);
});
test('Every node has a written time-and-place passage; immediate continuations stay in the conversation',()=>{
 for(const node of Object.values(story.nodes)){
  assert.ok(chapterPassages[node.id],node.id);
  const passage=chapterCard(node);
  assert.ok(passage.text.length>20);
  assert.ok(passage.time.length>2);
 }
 for(const id of ['B02','B03','B09'])assert.equal(chapterCard(story.nodes[id],'previous'),null);
 assert.ok(chapterCard(story.nodes.S15,'S02').text.includes('备用笔'));
});
