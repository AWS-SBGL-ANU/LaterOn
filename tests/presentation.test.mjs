import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newGame,advance,choose,validateSave} from '../src/domain/engine.mjs';
import {backgroundArt,sceneArt,planAdvance} from '../src/domain/presentation.mjs';
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
 assert.equal(next.art.url,'./art/atlases/moments-classroom.png');
});

test('A same-place branch keeps the stage while all age variants have distinct artwork',()=>{
 const state=reach('S09');readToChoice(state);choose(story,state,'A');
 while(state.index<state.queue.length-1)advance(story,state);
 const plan=planAdvance(story,state);assert.equal(plan.node.id,'B02');assert.equal(plan.artChanged,false);assert.equal(plan.crossScene,false);
 const variants=['high','university','adult'].map(era=>backgroundArt({backgroundId:'BG22'},{era}));
 assert.equal(new Set(variants.map(v=>v.id)).size,3);assert.equal(new Set(variants.map(v=>v.position)).size,3);
});

test('Ending art is prepared before its action, and stays through the closing thought and reload',()=>{
 const state=reach('E03',{S08:'C',B01:'B'});readToChoice(state);choose(story,state,'A');
 assert.equal(sceneArt(story.nodes.E03,state).id,'BG26');
 while(state.queue[state.index].kind!=='action') {
  const plan=planAdvance(story,state);
  if(plan.beat?.kind==='action')assert.equal(plan.art.id,'E03-finale');
  advance(story,state);
 }
 assert.equal(sceneArt(story.nodes.E03,state).id,'E03-finale');advance(story,state);
 while(state.queue[state.index].kind!=='thought'){
  assert.equal(sceneArt(story.nodes.E03,state).id,'E03-finale');advance(story,state);
 }
 assert.equal(state.queue[state.index].kind,'thought');
 const restored=validateSave(story,structuredClone(state));
 assert.equal(sceneArt(story.nodes.E03,restored).id,'E03-finale');
 advance(story,state);assert.equal(sceneArt(story.nodes.E03,state).id,'E03-finale');
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
  assert.equal(sceneArt(story.nodes.E01,state).id,`E01-finale-${choice}`);
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
