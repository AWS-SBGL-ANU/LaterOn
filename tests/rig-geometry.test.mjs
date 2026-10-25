import test from 'node:test';
import assert from 'node:assert/strict';
import {solveArm,armLengths,solveRigFrame,headPoint,bodyPoint,rotatePoint,rigAnchors} from '../src/domain/rigGeometry.mjs';
import {timelineFor,sampleTimeline} from '../src/domain/puppetTimeline.mjs';
import {momentAt} from '../src/domain/detailedMovements.mjs';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const close=(a,b,tolerance=1e-7)=>assert.ok(distance(a,b)<=tolerance,`${JSON.stringify(a)} must meet ${JSON.stringify(b)}`);

test('Shoulder, elbow and intact forearm keep fixed lengths even for unreachable targets',()=>{
 for(const bend of [-1,1])for(const target of [{x:0,y:0},{x:500,y:0},{x:-100,y:-80},{x:30,y:20},{x:0,y:190}]){
  const arm=solveArm({x:0,y:0},target,bend);
  assert.ok(Math.abs(distance(arm.shoulder,arm.elbow)-armLengths.upper)<1e-7);
  assert.ok(Math.abs(distance(arm.elbow,arm.hand)-armLengths.lower)<1e-7);
  assert.ok(Object.values(arm.hand).every(Number.isFinite));
  assert.ok(distance(arm.shoulder,arm.hand)<armLengths.upper+armLengths.lower);
 }
});

test('Raised arms and props stay connected through movement, contact and release',()=>{
 for(const [action,object] of [['offer','water'],['offer','notebook'],['selfie','phone'],['hug','none'],['warm','drink'],['pour','thermos'],['taste','icecream'],['share-bag','groceries']]){
  const cue={action,object,actor:'boy',mode:'together'},timeline=timelineFor(cue);
  for(let i=0;i<=60;i++){
   const progress=i/60,source=sampleTimeline(timeline,progress);
   source.prop.scale=i%2?.65:1;
   const before=structuredClone(source),moment=momentAt(timeline,progress),frame=solveRigFrame(source,cue,progress,moment);
   for(const who of ['boy','girl'])for(const side of ['inner','outer']){
    const arm=frame.people[who][side];
    close(arm.shoulder,rigAnchors[who][side]);
    assert.ok(Math.abs(distance(arm.shoulder,arm.elbow)-armLengths.upper)<1e-7);
    assert.ok(Math.abs(distance(arm.elbow,arm.hand)-armLengths.lower)<1e-7);
   }
   if(frame.prop.owner){
    const offset=rotatePoint({x:frame.prop.grip.x*frame.prop.scale,y:frame.prop.grip.y*frame.prop.scale},frame.prop.angle);
    close({x:frame.prop.x+offset.x,y:frame.prop.y+offset.y},bodyPoint(frame.pose[frame.prop.owner],frame.people[frame.prop.owner][frame.prop.side].hand));
   }
   if(moment?.pour){
    const p=frame.prop,tip=rotatePoint({x:-32*p.scale,y:-65*p.scale},p.angle);
    assert.ok(frame.pourPath.startsWith(`M${p.x+tip.x} ${p.y+tip.y} `),'water starts at the actual tilted bottle mouth');
   }else assert.equal(frame.pourPath,null);
   assert.deepEqual(source,before,'render corrections cannot mutate a timeline or save');
  }
 }
});

test('Both hands meet before a transfer changes owner, without a jump at release',()=>{
 const cue={action:'offer',profile:'pass-water',object:'water',actor:'boy',mode:'together'},timeline=timelineFor(cue);
 const at=p=>solveRigFrame(sampleTimeline(timeline,p),cue,p,momentAt(timeline,p));
 for(const p of [.68,.73,.78,.82]){
  const frame=at(p);
  close(bodyPoint(frame.pose.girl,frame.people.girl.inner.hand),bodyPoint(frame.pose.boy,frame.people.boy.inner.hand));
 }
 assert.ok(distance(at(.73).prop,at(.730001).prop)<.01,'switching ownership must keep the object at the same contact point');
});

test('A wave bends the elbow and raises the palm above the shoulder',()=>{
 for(const actor of ['girl','boy']){
  const cue={action:'wave',object:'none',actor},timeline=timelineFor(cue);
  const frame=solveRigFrame(sampleTimeline(timeline,.5),cue,.5),arm=frame.people[actor].outer;
  assert.ok(arm.hand.y<arm.shoulder.y-50);
  assert.ok(arm.elbow.y>arm.hand.y+30,'the forearm lifts from a bent elbow');
 }
});

test('Worn earbuds follow actual ear landmarks through head turns and body tilt',()=>{
 const cue={nodeId:'S01',action:'sit-close',object:'earbuds',actor:'boy',mode:'together'};
 const timeline=timelineFor(cue);
 for(const head of [-15,0,15])for(const tilt of [-12,0,12]){
  const pose=sampleTimeline(timeline,1);pose.girl.head=head;pose.boy.head=-head;pose.girl.tilt=tilt;pose.boy.tilt=-tilt;
  const frame=solveRigFrame(pose,cue,1);
  for(const who of ['girl','boy']){
   assert.equal(frame.ears[who].worn,true);
   close(frame.ears[who],headPoint(frame.pose[who],rigAnchors[who].ear));
  }
 }
});

test('An earbud stays in the palm until seated, then stays at the ear as the hand lowers without an elbow flip',()=>{
 const cue={nodeId:'S01',action:'sit-close',object:'earbuds',actor:'boy',mode:'together'},timeline=timelineFor(cue);
 let last=null;
 for(let i=0;i<=300;i++){
  const frame=solveRigFrame(sampleTimeline(timeline,i/300),cue,i/300),arm=frame.people.boy.outer;
  const elbow=bodyPoint(frame.pose.boy,arm.elbow);
  if(last)assert.ok(distance(last,elbow)<8,'the elbow must follow a continuous path around the shoulder');
  last=elbow;
  close(frame.ears.boy,frame.ears.boy.worn?headPoint(frame.pose.boy,rigAnchors.boy.ear):bodyPoint(frame.pose.boy,arm.hand));
 }
});

test('A solo listening scene shows the actor earbud and offering does not pretend it is already worn',()=>{
 const cue={nodeId:'E04',action:'put-earbuds',profile:'put-earbuds',object:'earbuds',actor:'boy',mode:'solo'};
 const pose=sampleTimeline(timelineFor(cue),1),frame=solveRigFrame(pose,cue,1);
 assert.equal(frame.ears.boy.worn,true);assert.equal(frame.ears.girl.visible,false);
 const offering={nodeId:'S01',action:'offer',profile:'pass-earbud',object:'earbuds',actor:'girl'};
 const held=solveRigFrame(sampleTimeline(timelineFor(offering),1),offering,1);
 assert.equal(held.ears.boy.worn,false);
 close(held.ears.boy,bodyPoint(held.pose.boy,held.people.boy.inner.hand),25);
});
