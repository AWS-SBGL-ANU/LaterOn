import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newGame,enter,advance,choose} from '../src/domain/engine.mjs';
import {sceneArt,artDependencies} from '../src/domain/presentation.mjs';
const story=JSON.parse(fs.readFileSync(new URL('../src/data/story.json',import.meta.url),'utf8'));
function staticArt(node,state){
 const before=structuredClone(state),art=sceneArt(node,state,'./');
 assert.equal(art.performance,undefined,'a scene must not start a character performance');
 assert.equal(art.key,art.id,'dialogue changes must not restart a shot');
 assert.deepEqual(artDependencies(art),[art.url],'only a completed illustration is preloaded');
 assert.ok(fs.existsSync(new URL(`../public/${art.url.slice(2)}`,import.meta.url)));
 assert.equal(art.size,'300% 300%');
 assert.deepEqual(state,before,'rendering must not change story progress');
 return art;
}
test('All 39 nodes and 105 choices use finished static scenes, including closing responses',()=>{
 let count=0;
 for(const node of Object.values(story.nodes)){
  const dialogue=newGame(story);enter(story,dialogue,node.id);
  while(dialogue.phase==='dialogue'){staticArt(node,dialogue);advance(story,dialogue);}
  for(const option of node.choices){
   const state=newGame(story);state.facts.plan=true;enter(story,state,node.id);
   while(state.phase==='dialogue')advance(story,state);
   choose(story,state,option.id);count++;
   while(state.nodeId===node.id){
    staticArt(node,state);
    if(state.phase==='completed')break;
    advance(story,state);
   }
  }
 }
 assert.equal(count,105);
});
test('Returning to a saved line or completed ending restores the same static illustration',()=>{
 for(const id of ['S01','S15','S17','S10','E01','E02','E03','E04']){
  const node=story.nodes[id],state=newGame(story);enter(story,state,id);
  while(state.phase==='dialogue'){
   assert.deepEqual(sceneArt(node,state),sceneArt(node,structuredClone(state)));advance(story,state);
  }
  choose(story,state,'A');
  while(state.nodeId===id){
   assert.deepEqual(sceneArt(node,state),sceneArt(node,structuredClone(state)));
   if(state.phase==='completed')break;
   advance(story,state);
  }
 }
});
