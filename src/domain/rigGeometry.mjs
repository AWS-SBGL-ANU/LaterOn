// All contact points live in the same hierarchy as the visible drawings.
// Arms have two fixed-length bones; the forearm and hand remain one image.
export const armLengths=Object.freeze({upper:92,lower:100});
export const armArtwork=Object.freeze({
 'girl-upper':{joint:[.5,.1],end:[.5,.9]},'boy-upper':{joint:[.5,.1],end:[.5,.9]},
 'girl-lower':{joint:[.42,.07],end:[.6,.88]},'boy-lower':{joint:[.53,.07],end:[.44,.88]}
});
export function segmentArtworkTransform(name,width,height,length){
 const art=armArtwork[name],a={x:art.joint[0]*width,y:art.joint[1]*height},b={x:art.end[0]*width,y:art.end[1]*height};
 const angle=90-Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI,scale=length/Math.hypot(b.x-a.x,b.y-a.y);
 return `rotate(${angle}) scale(${scale}) translate(${-a.x} ${-a.y})`;
}
export const rigAnchors=Object.freeze({
 girl:{inner:{x:246,y:280},outer:{x:92,y:280},ear:{x:140,y:246},mouth:{x:267,y:220}},
 boy:{inner:{x:110,y:280},outer:{x:250,y:280},ear:{x:262,y:260},mouth:{x:83,y:235}}
});
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const mix=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
const arc=(a,control,b,t)=>mix(mix(a,control,t),mix(control,b,t),t);
const ease=t=>{const v=clamp(t,0,1);return v*v*(3-2*v);};
export function rotatePoint(point,angle,origin={x:0,y:0}){
 const r=angle*Math.PI/180,c=Math.cos(r),s=Math.sin(r),x=point.x-origin.x,y=point.y-origin.y;
 return {x:origin.x+x*c-y*s,y:origin.y+x*s+y*c};
}
export function bodyPoint(person,local){const p=rotatePoint(local,person.tilt,{x:170,y:550});return {x:p.x+person.x,y:p.y+person.y};}
export function localPoint(person,world){return rotatePoint({x:world.x-person.x,y:world.y-person.y},-person.tilt,{x:170,y:550});}
export function headPoint(person,local){return bodyPoint(person,rotatePoint(local,person.head,{x:170,y:270}));}
export function solveArm(shoulder,target,bend=1){
 const {upper,lower}=armLengths,dx=target.x-shoulder.x,dy=target.y-shoulder.y;
 const distance=clamp(Math.hypot(dx,dy),Math.abs(lower-upper)+3,upper+lower-2);
 const direction=Math.atan2(dy,dx),a=Math.acos(clamp((upper*upper+distance*distance-lower*lower)/(2*upper*distance),-1,1));
 const angle=direction+bend*a,elbow={x:shoulder.x+upper*Math.cos(angle),y:shoulder.y+upper*Math.sin(angle)};
 const hand={x:shoulder.x+distance*Math.cos(direction),y:shoulder.y+distance*Math.sin(direction)};
 return {shoulder:{...shoulder},elbow,hand,
  upperAngle:Math.atan2(elbow.y-shoulder.y,elbow.x-shoulder.x)*180/Math.PI-90,
  lowerAngle:Math.atan2(hand.y-elbow.y,hand.x-elbow.x)*180/Math.PI-90};
}
function defaultTarget(who,side,person){
 const shoulder=rigAnchors[who][side],inward=side==='inner';
 const direction=inward?(who==='girl'?76:104):90;
 const angle=(direction+clamp(person[side],-65,65)*.8)*Math.PI/180;
 const length=inward?160:162;
 return {x:shoulder.x+length*Math.cos(angle),y:shoulder.y+length*Math.sin(angle)};
}
const gripPoints={phone:{x:0,y:25},pen:{x:0,y:12},icecream:{x:0,y:26},bottle:{x:0,y:20},water:{x:0,y:20},drink:{x:0,y:20},thermos:{x:0,y:20},spoon:{x:0,y:48},umbrella:{x:0,y:18},bag:{x:0,y:-70},breakfast:{x:0,y:-70},groceries:{x:0,y:-70},tissue:{x:0,y:8},star:{x:0,y:20},eraser:{x:0,y:15},keys:{x:0,y:-25},ball:{x:0,y:42},chopsticks:{x:0,y:20}};
const transferProfiles=new Set(['offer','receive','receive-water','pass-earbud','pass-water','pass-drink','offer-tissue','offer-snack','pass-chopsticks','pass-spoon','share-tissue']);
export function earbudProgress(cue,progress){
 const profile=cue.profile??cue.action;
 if(profile==='prepare-listening')return {mode:'resting',wear:0,hand:0};
 if(profile==='pass-earbud')return {mode:'offering',wear:0,hand:0};
 const wear=ease((progress-.16)/.46),hand=wear*(1-ease((progress-.78)/.22));
 return {mode:'worn',wear,hand};
}
export function solveRigFrame(input,cue,progress=1,moment=null){
 const pose=structuredClone(input),actor=cue.actor==='girl'?'girl':'boy',other=actor==='girl'?'boy':'girl';
 const profile=cue.profile??cue.action,object=moment?.object??cue.object;
 const targets={};
 for(const who of ['girl','boy'])targets[who]={inner:defaultTarget(who,'inner',pose[who]),outer:defaultTarget(who,'outer',pose[who])};
 let owner=actor,prop=null;
 const heldSide=['selfie','wipe-and-selfie','lower-camera'].includes(profile)?'outer':'inner';
 const transfer=transferProfiles.has(profile)&&object!=='earbuds'&&cue.mode!=='remote';
 let transferTarget=null;
 if(transfer){
  const receiving=['receive','receive-water'].includes(profile),giver=receiving?other:actor,receiver=giver==='girl'?'boy':'girl';
  owner=progress>.73?receiver:giver;
  // Let the two drawings approach enough to share a physical contact point.
  // Do not pass an object through empty space between unattached hands.
  const a=bodyPoint(pose.girl,rigAnchors.girl.inner),b=bodyPoint(pose.boy,rigAnchors.boy.inner);
  const shift=clamp((b.x-a.x-310)/2,-80,80)*ease((progress-.1)/.3);
  pose.girl.x+=shift;pose.boy.x-=shift;
  const left=bodyPoint(pose.girl,rigAnchors.girl.inner),right=bodyPoint(pose.boy,rigAnchors.boy.inner);
  const contact={x:(left.x+right.x)/2,y:(left.y+right.y)/2+66};
  const giverRest=bodyPoint(pose[giver],targets[giver].inner),receiverRest=bodyPoint(pose[receiver],targets[receiver].inner);
  const giving=ease((progress-.1)/.4),reaching=ease((progress-.38)/.28),release=ease((progress-.82)/.18);
  const givingHand=mix(mix(giverRest,contact,giving),giverRest,release);
  const receivingHand=mix(mix(receiverRest,contact,reaching),receiverRest,release);
  targets[giver].inner=localPoint(pose[giver],givingHand);
  targets[receiver].inner=localPoint(pose[receiver],receivingHand);
  transferTarget=owner===giver?givingHand:receivingHand;
 }
 if(['hug','embrace','release'].includes(profile)&&cue.mode!=='remote'){
  const holding=profile==='embrace'?1:profile==='release'?1-ease(progress/.7):ease((progress-.12)/.5);
  const a=headPoint(pose.girl,{x:170,y:145}),b=headPoint(pose.boy,{x:170,y:145});
  const shift=Math.max(0,(285-(b.x-a.x))/2)*(profile==='hug'?ease(progress/.45):holding);
  pose.girl.x-=shift;pose.boy.x+=shift;
  for(const who of ['girl','boy']){
   const partner=who==='girl'?'boy':'girl';
   const contact=bodyPoint(pose[partner],{x:who==='girl'?135:230,y:345});
   const rest=bodyPoint(pose[who],targets[who].inner);
   targets[who].inner=localPoint(pose[who],mix(rest,contact,holding));
   targets[who].outer=defaultTarget(who,'outer',{outer:0});
  }
 }
 if(['wave','last-wave','board-and-wave','brush-hair','touch-nape'].includes(profile)){
  const shoulder=rigAnchors[actor].outer,raised=clamp(Math.abs(pose[actor].outer)/55,0,1);
  const wave=['wave','last-wave','board-and-wave'].includes(profile);
  const target=wave?{x:shoulder.x+(actor==='girl'?-100:100)+Math.sin(progress*Math.PI*8)*12*raised,y:shoulder.y-90}
   :localPoint(pose[actor],headPoint(pose[actor],{x:rigAnchors[actor].ear.x,y:rigAnchors[actor].ear.y-25}));
  targets[actor].outer=mix(defaultTarget(actor,'outer',{outer:0}),target,raised);
 }
 const freeObject=['drop','floor','star-falls'].includes(profile);
 const grip=gripPoints[object]??(transfer?{x:0,y:25}:null);
 if(grip&&!freeObject){
  let desired={x:pose.prop.x,y:pose.prop.y};
  const offset=rotatePoint({x:grip.x*pose.prop.scale,y:grip.y*pose.prop.scale},pose.prop.angle);
  desired={x:desired.x+offset.x,y:desired.y+offset.y};
  if(transferTarget)desired=transferTarget;
  if(['taste','warm-cup','warm','sip-and-pause'].includes(profile)&&/唇|喝|尝|吹/.test(moment?.label??'')){
   const mouth=headPoint(pose[owner],rigAnchors[owner].mouth);
   desired={x:mouth.x,y:mouth.y+(object==='spoon'?110:64)};
  }
  const local=localPoint(pose[owner],desired);
  if(heldSide==='outer'){
   const shoulder=rigAnchors[owner].outer;
   local.x=owner==='boy'?Math.max(shoulder.x+30,local.x):Math.min(shoulder.x-30,local.x);
  }
  targets[owner][heldSide]=local;
 }
 const ears={};
 if(object==='earbuds'){
  const state=earbudProgress(cue,progress),shared=cue.nodeId==='S01'||['sit-close','adjust-earbud','pass-earbud'].includes(profile);
  for(const who of ['girl','boy']){
   const ear=headPoint(pose[who],rigAnchors[who].ear);
   if(state.mode==='resting'){ears[who]={...ear,visible:false,worn:false};continue;}
   if(!shared&&who!==actor){ears[who]={...ear,visible:false,worn:false};continue;}
   if(shared&&who==='girl'){ears[who]={...ear,visible:true,worn:true};continue;}
   const rest=bodyPoint(pose[who],targets[who].outer);
   if(state.mode==='offering'){ears[who]={...bodyPoint(pose[who],targets[who].inner),visible:true,worn:false};continue;}
   // Travel around the shoulder, rather than folding through its centre.
   // The same curved path is reversed as the empty hand comes back down.
   const control=bodyPoint(pose[who],{x:rigAnchors[who].outer.x+(who==='girl'?-130:130),y:rigAnchors[who].outer.y-45});
   targets[who].outer=localPoint(pose[who],arc(rest,control,ear,state.hand));
   ears[who]={...arc(rest,control,ear,state.wear),visible:true,worn:state.wear===1};
  }
 }
 const people={};
 for(const who of ['girl','boy']){
  const inner=solveArm(rigAnchors[who].inner,targets[who].inner,who==='girl'?1:-1);
  const outer=solveArm(rigAnchors[who].outer,targets[who].outer,who==='girl'?-1:1);
  people[who]={inner,outer};
  if(ears[who]?.visible&&!ears[who].worn){
   const side=earbudProgress(cue,progress).mode==='offering'?'inner':'outer';
   Object.assign(ears[who],bodyPoint(pose[who],people[who][side].hand));
  }
 }
 if(grip&&!freeObject){
  const hand=bodyPoint(pose[owner],people[owner][heldSide].hand),offset=rotatePoint({x:grip.x*pose.prop.scale,y:grip.y*pose.prop.scale},pose.prop.angle);
  prop={...pose.prop,x:hand.x-offset.x,y:hand.y-offset.y,owner,side:heldSide,hand,grip};
 }else prop={...pose.prop,owner:null};
 const visibleEars=Object.values(ears).filter(e=>e.visible);
 const wireJoin=visibleEars.length>1?{x:(visibleEars[0].x+visibleEars[1].x)/2,y:Math.max(...visibleEars.map(p=>p.y))+135}
  :visibleEars.length?{x:visibleEars[0].x+15,y:visibleEars[0].y+145}:{x:0,y:0};
 const wires=visibleEars.map(e=>`M${e.x} ${e.y} C${e.x} ${e.y+65} ${wireJoin.x} ${wireJoin.y+30} ${wireJoin.x} ${wireJoin.y}`);
 let pourPath=null;
 if(moment?.pour){
  const cup=moment.extras?.find(extra=>extra.kind==='drink');
  if(cup){
   const tip=rotatePoint({x:-32*prop.scale,y:-65*prop.scale},prop.angle);
   const start={x:prop.x+tip.x,y:prop.y+tip.y},end={x:cup.x,y:cup.y-60*(cup.scale??1)};
   pourPath=`M${start.x} ${start.y} Q${(start.x+end.x)/2} ${start.y+35} ${end.x} ${end.y}`;
  }
 }
 return {pose,people,prop,ears,wires,wireJoin,object,pourPath};
}
