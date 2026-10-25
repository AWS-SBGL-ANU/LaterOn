import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newGame,enter,advance,choose,validateSave} from '../src/domain/engine.mjs';
import {lineRefinements} from '../src/domain/storyRefinements.mjs';
const story=JSON.parse(fs.readFileSync(new URL('../src/data/story.json',import.meta.url),'utf8'));
test('Earlier editorial wording upgrades without losing the saved line, choice or checkpoints',()=>{
 for(const [nodeId,choice] of [['S01','A'],['S06','A'],['S12','B']]){
  const state=newGame(story);enter(story,state,nodeId);
  while(state.phase==='dialogue')advance(story,state);
  choose(story,state,choice);
  const earlier=structuredClone(state);
  for(const container of [earlier,...earlier.checkpoints])container.queue=container.queue.map(beat=>{
   const edit=lineRefinements.find(edit=>edit.id===beat.id&&edit.to===beat.text);
   return edit?{...beat,text:edit.from}:beat;
  });
  assert.deepEqual(validateSave(story,earlier),state);
 }
});
test('Editorial compatibility rejects arbitrary rewritten save dialogue',()=>{
 const state=structuredClone(newGame(story));state.queue[0].text='Someone changed the story';
 assert.throws(()=>validateSave(story,state));
});
