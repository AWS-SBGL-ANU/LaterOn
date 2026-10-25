import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newGame,enter,advance,choose} from '../src/domain/engine.mjs';
import {sceneArt} from '../src/domain/presentation.mjs';
import {artDependencies} from '../src/domain/choreography.mjs';
import {timelineFor,sampleTimeline} from '../src/domain/puppetTimeline.mjs';
import {sceneDirections} from '../src/domain/sceneDirections.mjs';
import {hasDetailedMovement,momentAt} from '../src/domain/detailedMovements.mjs';
const story=JSON.parse(fs.readFileSync(new URL('../src/data/story.json',import.meta.url),'utf8'));

function atChoice(nodeId) {
 const state=newGame(story);
 state.facts.plan=true;
 enter(story,state,nodeId);
 while(state.phase==='dialogue')advance(story,state);
 return state;
}
function numericPose(pose) {
 for(const values of Object.values(pose))for(const value of Object.values(values))assert.ok(Number.isFinite(value),'every joint and prop value must be finite');
 assert.ok(pose.prop.opacity>=0&&pose.prop.opacity<=1);
}

test('All 105 choices produce preloadable, finite animation responses without changing saved progress',()=>{
 let choices=0;
 for(const node of Object.values(story.nodes))for(const option of node.choices){
  const state=atChoice(node.id);choose(story,state,option.id);choices++;
  while(state.nodeId===node.id&&state.phase!=='completed'){
   const before=structuredClone(state),art=sceneArt(node,state,'./');
   assert.ok(art.performance,`${node.id}:${option.id} needs an actual performance`);
   assert.deepEqual(artDependencies(art,'./'),[art.url,'./art/puppets/soft-parts.png','./art/puppets/arm-segments.png']);
   const timeline=timelineFor(art.performance);
   assert.ok(timeline.duration>0);
   for(const progress of [0,.1,.32,.5,.68,.9,1])numericPose(sampleTimeline(timeline,progress));
   assert.deepEqual(sampleTimeline(timeline,1),timeline.frames.at(-1));
   assert.deepEqual(state,before,'drawing and sampling must not advance the story');
   advance(story,state);
  }
 }
 assert.equal(choices,105);
});

test('All authored character actions have finite motion and ordinary dialogue keeps its performance key',()=>{
 const actions=new Set();
 for(const node of Object.values(story.nodes)){
  const state=newGame(story);enter(story,state,node.id);
  let previous=null,previousBeat=null;
  while(state.phase==='dialogue'){
   const beat=state.queue[state.index],art=sceneArt(node,state);
   if(art.performance){
    actions.add(art.performance.action);
    const timeline=timelineFor(art.performance);
    numericPose(sampleTimeline(timeline,.5));
    if(previous?.performance&&previous.id===art.id&&beat.kind!=='action'&&previousBeat.art===beat.art&&previous.performance.onset===art.performance.onset){
     assert.equal(art.key,previous.key,`${node.id}: ordinary dialogue must not restart the motion`);
    }
   }
   previous=art;previousBeat=beat;advance(story,state);
  }
 }
 for(const action of ['touch','drop','bend','pickup','pour','lean'])assert.ok(actions.has(action),action);
});

test('Airport, bridge and university hugs begin at their authored action after the spoken agreement',()=>{
 for(const [id,choice,needle] of [['S10','A','他才慢慢抱住她'],['B03','B','她点了点头'],['S13','A','接进怀里']]){
  const state=atChoice(id);choose(story,state,choice);
  const onset=state.queue.findIndex(b=>b.kind==='action'&&b.text.includes(needle));
  assert.ok(onset>=0);
  assert.ok(state.queue.slice(0,onset).some(b=>b.speaker==='小梦'&&/嗯|可以|但不是/.test(b.text)));
  while(state.nodeId===id){
   const cue=sceneArt(story.nodes[id],state).performance;
   if(state.index<onset)assert.ok(!['hug','embrace'].includes(cue?.action),`${id}: premature hug`);
   if(state.index===onset)assert.equal(cue.action,'hug');
   advance(story,state);
  }
 }
});

test('Remote conversations stay separated throughout interpolation, including an inherited close pose',()=>{
 const close=sampleTimeline(timelineFor({action:'hug',object:'none',mode:'together',actor:'boy'}),1);
 for(const id of ['S11','S12','S14','B04','B05','B06','B07','B08','B09','D02']){
  for(const option of story.nodes[id].choices){
   const state=atChoice(id);choose(story,state,option.id);
   const cue=sceneArt(story.nodes[id],state).performance;
   assert.equal(cue.mode,'remote');
   const timeline=timelineFor(cue,close);
   for(let step=0;step<=20;step++){
    const pose=sampleTimeline(timeline,step/20);
    assert.ok(pose.girl.x+340<pose.boy.x,'remote characters must not enter the same partition');
    assert.ok(pose.prop.x>900||pose.prop.x<700,'props must stay in a room');
   }
  }
 }
});

test('Consecutive local actions interpolate from the captured pose without altering it',()=>{
 const previous=sampleTimeline(timelineFor({action:'open-arms',object:'none',actor:'boy'}),.6);
 const snapshot=structuredClone(previous);
 const next=timelineFor({action:'hug',object:'none',actor:'boy'},previous);
 assert.deepEqual(sampleTimeline(next,0),previous);
 numericPose(sampleTimeline(next,.5));
 assert.deepEqual(previous,snapshot);
 assert.deepEqual(sampleTimeline(next,-1),sampleTimeline(next,0));
 assert.deepEqual(sampleTimeline(next,2),sampleTimeline(next,1));
});

test('An action held through following dialogue and completed endings restores as a settled pose',()=>{
 const node=story.nodes.S15,state=newGame(story);enter(story,state,'S15');
 while(state.phase==='dialogue'){
  const art=sceneArt(node,state),restored=sceneArt(node,structuredClone(state));
  assert.deepEqual(restored,art);
  if(art.performance&&state.index>0&&state.queue[state.index].kind!=='action'&&state.queue[state.index].art===state.queue[state.index-1].art){
   assert.equal(restored.performance.settled,true);
  }
  advance(story,state);
 }
 assert.equal(sceneArt(node,state).performance.settled,true);
 for(const id of ['E01','E02','E03','E04']){
  const end=atChoice(id);choose(story,end,'A');
  while(end.phase!=='completed')advance(story,end);
  assert.equal(sceneArt(story.nodes[id],end).performance.settled,true);
 }
});

test('All 149 concrete directions are in the script and resolve to timed multi-step performances',()=>{
 let count=0;
 assert.equal(Object.keys(sceneDirections).length,39);
 for(const [id,directions] of Object.entries(sceneDirections)){
  const node=story.nodes[id],beats=[...node.beats,...node.choices.flatMap(c=>c.response),...node.tail];
  for(const [needle,profile] of directions){
   count++;
   const beat=beats.find(b=>['action','narration'].includes(b.kind)&&b.text.includes(needle));
   assert.ok(beat,`${id}: missing authored direction ${needle}`);
   assert.ok(hasDetailedMovement(profile),`${id}: missing ${profile}`);
   const state=newGame(story);enter(story,state,id);state.queue=[beat];state.index=0;
   const cue=sceneArt(node,state).performance;
   assert.equal(cue.profile,profile,`${id}: a concrete direction must override a generic pose`);
   const timeline=timelineFor(cue);
   assert.ok(timeline.moments.length>=3,`${profile} needs distinct stages`);
   assert.equal(timeline.stops[0],0);assert.equal(timeline.stops.at(-1),1);
   for(let i=1;i<timeline.stops.length;i++)assert.ok(timeline.stops[i]>timeline.stops[i-1]);
   for(let i=0;i<=30;i++){numericPose(sampleTimeline(timeline,i/30));assert.ok(momentAt(timeline,i/30).label);}
  }
 }
 assert.equal(count,149);
});

test('Handing over water waits for the receiver before the giver withdraws',()=>{
 const timeline=timelineFor({action:'offer',profile:'pass-water',object:'water',actor:'boy'});
 assert.deepEqual(timeline.frames[2],timeline.frames[3],'hold the offered bottle while waiting');
 assert.equal(timeline.frames[3].girl.inner,0,'the receiver has not reached yet');
 assert.notEqual(timeline.frames[4].girl.inner,0,'the receiver reaches before release');
 assert.equal(timeline.frames[3].boy.inner,timeline.frames[4].boy.inner,'the giver keeps supporting the bottle');
 assert.notEqual(timeline.frames[5].boy.inner,timeline.frames[4].boy.inner,'the giver withdraws last');
 const receiving=timelineFor({action:'receive',profile:'receive-water',object:'water',actor:'girl'});
 assert.equal(receiving.frames[3].girl.inner,receiving.frames[0].girl.inner,'a receiving actor keeps the starting pose while the other person offers');
 assert.notEqual(receiving.frames[4].girl.inner,receiving.frames[0].girl.inner);
 assert.notEqual(receiving.frames[5].boy.inner,receiving.frames[4].boy.inner,'the giver, not the receiver, withdraws');
 assert.ok(receiving.moments.every(m=>m.object==='bottle'&&m.extras.length===1),'the second water bottle stays with the giver');
});

test('Pouring and tasting keep independent props and turn their effects off at completion',()=>{
 const pour=timelineFor({action:'pour',object:'thermos',actor:'boy'});
 assert.equal(pour.moments[0].open,false);
 assert.ok(pour.moments.some(m=>m.open&&m.pour&&m.extras.some(p=>p.kind==='drink')));
 assert.equal(pour.moments.at(-1).pour,false);
 assert.equal(pour.frames.at(-1).prop.angle,0);
 const taste=timelineFor({action:'taste',object:'icecream',actor:'girl'});
 assert.ok(taste.moments.some(m=>m.object==='spoon'&&m.loaded));
 assert.ok(taste.moments.every(m=>m.extras.length===1&&m.extras[0].kind==='icecream-cup'));
 assert.equal(taste.moments.at(-1).loaded,false);
});

test('The bridge hug preserves her hesitation and the job offer conversation stays in one room',()=>{
 const bridge=timelineFor({action:'hug',object:'none',actor:'boy',setting:'bridge'});
 const airport=timelineFor({action:'hug',object:'none',actor:'boy',setting:'airport'});
 assert.notEqual(bridge.frames.at(-1).girl.inner,airport.frames.at(-1).girl.inner);
 assert.ok(bridge.moments.some(m=>m.eyes==='boy'));
 assert.ok(!bridge.moments.some(m=>m.eyes==='both'));
 for(const option of story.nodes.B10.choices){
  const state=atChoice('B10');choose(story,state,option.id);
  assert.equal(sceneArt(story.nodes.B10,state).performance.mode,'together');
 }
});
