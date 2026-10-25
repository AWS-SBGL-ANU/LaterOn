import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newGame,advance,choose,validateSave} from '../src/domain/engine.mjs';
import {backgroundArt,sceneArt,planAdvance,planChoice} from '../src/domain/presentation.mjs';
const story=JSON.parse(fs.readFileSync(new URL('../src/data/story.json',import.meta.url),'utf8'));

function reach(id, decisions={}) {
 const state=newGame(story);
 for(let steps=0;steps<1500;steps++) {
  if(state.nodeId===id)return state;
  if(state.phase==='choosing')choose(story,state,decisions[state.nodeId]??'A');
  else advance(story,state);
 }
 throw Error('Node not reached '+id);
}
function readToChoice(state){while(state.phase!=='choosing')advance(story,state);}

test('Planning a page turn preserves the saved line until the illustration is ready',()=>{
 const state=newGame(story);readToChoice(state);choose(story,state,'A');
 const before=structuredClone(state),plan=planAdvance(story,state);
 assert.deepEqual(state,before);assert.equal(plan.artChanged,false);assert.equal(plan.crossScene,false);
 while(state.index<state.queue.length-1)advance(story,state);
 const final=structuredClone(state),next=planAdvance(story,state,'./');
 assert.deepEqual(state,final);assert.equal(next.node.id,'S02');assert.equal(next.crossScene,true);
 assert.ok(next.art.url.startsWith('./art/storyboards/'));assert.equal(next.art.storyboard,true);
});

test('A same-place branch gets a fresh illustrated shot while age variants stay distinct',()=>{
 const state=reach('S09');readToChoice(state);choose(story,state,'A');
 while(state.index<state.queue.length-1)advance(story,state);
 const art=sceneArt(story.nodes[state.nodeId],state),plan=planAdvance(story,state);
 assert.equal(plan.node.id,'B02');assert.notEqual(plan.art.key,art.key);assert.equal(plan.artChanged,true);assert.equal(plan.crossScene,false);
 const variants=['high','university','adult'].map(era=>backgroundArt({backgroundId:'BG22'},{era}));
 assert.equal(new Set(variants.map(v=>v.id)).size,3);assert.equal(new Set(variants.map(v=>v.position)).size,3);
});

test('Ending art is prepared before its action, and stays through the closing thought and reload',()=>{
 const state=reach('E03',{S08:'C',B01:'B'});readToChoice(state);choose(story,state,'A');
 assert.equal(sceneArt(story.nodes.E03,state).eventId,'BG26');
 while(state.queue[state.index].kind!=='action') {
  const plan=planAdvance(story,state);
  if(plan.beat?.kind==='action')assert.equal(plan.art.eventId,'E03-finale');
  advance(story,state);
 }
 assert.equal(sceneArt(story.nodes.E03,state).eventId,'E03-finale');advance(story,state);
 while(state.queue[state.index].kind!=='thought'){
  assert.equal(sceneArt(story.nodes.E03,state).eventId,'E03-finale');advance(story,state);
 }
 assert.equal(state.queue[state.index].kind,'thought');
 const restored=validateSave(story,structuredClone(state));
 assert.equal(sceneArt(story.nodes.E03,restored).eventId,'E03-finale');
 advance(story,state);assert.equal(sceneArt(story.nodes.E03,state).eventId,'E03-finale');
});

test('Invalid imported histories, checkpoints, routes and dialogue fail before replacing progress',()=>{
 const state=reach('S03');
 for(const mutate of [
  s=>{s.checkpoints=null;},
  s=>{s.checkpoints[0].nodeId='missing';},
  s=>{s.checkpoints[0].checkpoints=[{}];},
  s=>{s.history=[null];},
  s=>{s.facts.era='missing';},
  s=>{s.queue[0].text='Not in the script';},
  s=>{s.next='E01';},
  s=>{s.phase='completed';}
 ]){const broken=structuredClone(state);mutate(broken);assert.throws(()=>validateSave(story,broken));}
 assert.deepEqual(validateSave(story,structuredClone(state)),state);
});

test('Both everyday ending choices use their own closing illustration',()=>{
 for(const choice of ['A','B']){
  const state=reach('E01');readToChoice(state);choose(story,state,choice);
  while(state.phase!=='completed')advance(story,state);
  assert.equal(sceneArt(story.nodes.E01,state).eventId,`E01-finale-${choice}`);
  assert.deepEqual(validateSave(story,state),state);
 }
});

test('Every reading phase along the five acceptance routes can be exported and restored',()=>{
 const routes=[{},
  {S09:'B',B03:'B',S12:'C',B06:'A',B07:'B',S13:'A',S14:'B',B09:'A',B10:'A',B11:'A'},
  {S09:'B',B03:'B',S12:'C',B06:'B',S13:'B',S14:'B',B09:'B'},
  {S08:'C',B01:'B'}, {S12:'B',S14:'C'}];
 for(const route of routes){
  const state=newGame(story);
  for(let count=0;count<1500;count++){
   assert.deepEqual(validateSave(story,state),state);
   if(state.phase==='completed')break;
   if(state.phase==='choosing')choose(story,state,route[state.nodeId]??'A');
   else advance(story,state);
   assert.ok(count<1499,'route must terminate');
  }
 }
});

test('A choice preserves the final pen pose instead of teleporting the pen back to the desk',()=>{
 const state=reach('S15');readToChoice(state);
 const before=sceneArt(story.nodes.S15,state);
 assert.equal(before.eventId,'pen-writing');
 const copy=structuredClone(state),preview=planChoice(story,state,'A');
 assert.deepEqual(state,copy);
 assert.equal(preview.art.eventId,before.eventId);
 choose(story,state,'A');
 assert.equal(sceneArt(story.nodes.S15,state).eventId,before.eventId);
 const restored=validateSave(story,structuredClone(state));
 assert.equal(sceneArt(story.nodes.S15,restored).eventId,before.eventId);
});

test('Pen actions, a shared spoon and a shoulder follow their authored order',()=>{
 const expectations={
  S15:['BG28','pen-offer','school-fingers','pen-fall','pen-floor','pen-reach','pen-near','pen-pickup','pen-writing'],
  S17:['BG30','bench-ask','bench-pass','bench-spoon','school-share-icecream','bench-shy','bench-talk'],
  S19:['BG32','bus-offer','school-shoulder']
 };
 for(const [id,expected] of Object.entries(expectations)){
  const state=reach(id),seen=[];
  while(state.phase!=='choosing'){
   const shot=sceneArt(story.nodes[id],state);
   if(shot.eventId!==seen.at(-1))seen.push(shot.eventId);
   assert.equal(shot.boySide,'right');assert.equal(shot.size,'300% 300%');
   advance(story,state);
  }
  assert.deepEqual(seen,expected);
 }
});

test('The airport hug follows a question, agreement, open arms and a step forward',()=>{
 const state=reach('S10');readToChoice(state);
 const saved=structuredClone(state),preview=planChoice(story,state,'A');
 assert.deepEqual(state,saved);
 assert.equal(preview.art.eventId,'airport-breakfast');
 choose(story,state,'A');
 const seen=[];
 while(state.nodeId==='S10'){
  const art=sceneArt(story.nodes.S10,state);
  if(art.eventId!==seen.at(-1))seen.push(art.eventId);
  advance(story,state);
 }
 assert.deepEqual(seen,['airport-breakfast','airport-open','airport-step','airport-hug','airport-hold','airport-release']);
 const response=story.nodes.S10.choices[0].response;
 const hug=response.findIndex(b=>b.art==='airport-hug');
 assert.ok(response.slice(0,hug).some(b=>b.text==='我能抱你一下吗？'));
 assert.ok(response.slice(0,hug).some(b=>b.text==='嗯。先把袋子放好。'));
 for(const choice of ['B','C']){
  const alternate=reach('S10');readToChoice(alternate);choose(story,alternate,choice);
  while(alternate.nodeId==='S10'){
   assert.ok(!['airport-hug','airport-hold'].includes(sceneArt(story.nodes.S10,alternate).eventId));
   advance(story,alternate);
  }
 }
});

test('A bad choice preview leaves progress untouched',()=>{
 const state=reach('S17');readToChoice(state);const before=structuredClone(state);
 assert.equal(planChoice(story,state,'missing'),null);assert.deepEqual(state,before);
});
