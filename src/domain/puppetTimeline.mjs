// Coordinates use the stage's 1600 x 900 paper, with joint angles in degrees.
import { detailedTimeline } from './detailedMovements.mjs';
const person=(x)=>({x,y:155,tilt:0,head:0,inner:0,outer:0,wrist:0});
const base=()=>({girl:person(350),boy:person(920),prop:{x:800,y:610,angle:0,scale:1,opacity:1}});
const copy=p=>structuredClone(p);
function move(p,who,values){Object.assign(p[who],values);return p;}

export function timelineFor(cue,from=null) {
 const start=base(),end=copy(start),middle=copy(start);
 const actor=cue.actor==='girl'?'girl':'boy',other=actor==='girl'?'boy':'girl';
 const reach=who=>who==='girl'?-22:22;
 let duration=2000,via=null;
 switch(cue.action) {
  case 'offer':case 'show':case 'invite':case 'receive':case 'offer-hand':
   move(start,actor,{inner:actor==='girl'?42:-42});
   move(end,actor,{inner:reach(actor),head:actor==='girl'?4:-4});
   move(end,other,{inner:cue.action==='receive'?reach(other):0,head:other==='girl'?5:-5});
   start.prop.x=actor==='girl'?620:1025;end.prop.x=790;end.prop.y=570;break;
  case 'touch':case 'hold-hands':case 'pinky':
   duration=3400;move(start,'girl',{inner:42});move(start,'boy',{inner:-42});
   move(end,'girl',{x:450,inner:-22,head:7});move(end,'boy',{x:820,inner:22,head:-7});
   end.prop.opacity=cue.object==='pen'?1:0;end.prop.y=568;break;
  case 'drop':
   duration=1400;start.prop={x:800,y:558,angle:12,scale:1,opacity:1};
   end.prop={x:805,y:808,angle:81,scale:1,opacity:1};move(end,'girl',{inner:15});move(end,'boy',{inner:-15});break;
  case 'floor':start.prop.y=end.prop.y=808;start.prop.angle=end.prop.angle=81;duration=500;break;
  case 'bend':case 'pickup':case 'look':
   duration=2600;start.prop.y=808;end.prop.y=cue.action==='pickup'?620:808;
   move(end,'girl',{x:460,y:275,tilt:17,head:9,inner:-35});
   move(end,'boy',{x:830,y:275,tilt:-17,head:-9,inner:35});
   if(cue.action==='pickup'){move(start,'boy',{y:275,tilt:-17,inner:35});move(end,'boy',{y:155,tilt:0,head:-8,inner:0});}
   break;
  case 'write':case 'pack':case 'close':case 'zip':
   duration=2500;move(end,actor,{head:12,inner:actor==='girl'?15:-15});
   move(middle,actor,{head:9,inner:actor==='girl'?-8:8});via=middle;
   end.prop.angle=cue.action==='close'?9:0;end.prop.y=640;break;
  case 'scoop':case 'taste':case 'warm':
   duration=2700;move(end,'girl',{head:6,inner:-34,outer:12});
   start.prop.x=end.prop.x=600;start.prop.y=650;end.prop.y=cue.action==='taste'?430:520;break;
  case 'pour':
   duration=2600;move(end,'boy',{inner:38,head:12});
   start.prop={x:1030,y:610,angle:0,scale:1,opacity:1};end.prop={x:830,y:550,angle:-42,scale:1,opacity:1};break;
  case 'shy':move(end,'girl',{head:-13});move(end,'boy',{head:13});end.prop.x=600;break;
  case 'offer-shoulder':move(end,'boy',{inner:38,head:-6});end.prop.opacity=0;break;
  case 'lean':
   duration=3500;move(end,'girl',{x:590,y:182,tilt:13,head:13});move(end,'boy',{x:830,head:-5});end.prop.y=710;break;
  case 'wake':
   move(start,'girl',{x:590,y:182,tilt:13,head:13});move(start,'boy',{x:830,head:-5});
   move(end,'girl',{x:470,head:5});move(end,'boy',{x:860,head:-5});end.prop.y=710;break;
  case 'open-arms':
   duration=2600;move(start,'boy',{inner:-40,outer:0});move(end,'boy',{inner:38,outer:-65,head:-6});end.prop.opacity=0;break;
  case 'approach':case 'sit-close':case 'selfie':
   duration=2800;move(end,'girl',{x:570,head:7});move(end,'boy',{x:865,head:-7});
   if(cue.action==='selfie'){move(end,'boy',{outer:-65});end.prop={x:1235,y:470,angle:-12,scale:1,opacity:1};}
   else end.prop.opacity=cue.object==='none'?0:1;break;
  case 'hug':case 'embrace':
   duration=4200;move(start,'girl',{x:570,head:7});move(start,'boy',{x:865,inner:30,outer:-50});
   move(middle,'girl',{x:560,y:190,tilt:7,head:12,inner:-40});move(middle,'boy',{x:785,head:-12,inner:45,outer:-35});
   move(end,'girl',{x:560,y:197,tilt:9,head:14,inner:-48,outer:18});move(end,'boy',{x:785,y:160,tilt:-3,head:-15,inner:54,outer:-28});
   if(cue.action==='embrace'){Object.assign(start,copy(end));duration=2200;move(middle,'girl',{...end.girl,y:200});}
   via=middle;start.prop.opacity=middle.prop.opacity=end.prop.opacity=0;break;
  case 'release':
   duration=3000;move(start,'girl',{x:560,y:197,tilt:9,head:14,inner:-48});move(start,'boy',{x:785,tilt:-3,head:-15,inner:54});
   move(end,'girl',{x:460,head:5});move(end,'boy',{x:860,head:-5});end.prop.opacity=0;break;
  case 'share-bag':
   move(end,'girl',{x:450,inner:-22});move(end,'boy',{x:830,inner:22});end.prop={x:800,y:665,angle:0,scale:1,opacity:1};break;
  case 'cook':move(end,'boy',{inner:18,head:7});move(middle,'boy',{inner:32,head:8});via=middle;end.prop.y=650;break;
  case 'wave':move(end,actor,{outer:actor==='girl'?55:-55,head:actor==='girl'?5:-5});move(middle,actor,{outer:actor==='girl'?80:-80});via=middle;break;
  case 'leave':move(end,actor,{x:actor==='girl'?90:1250,head:actor==='girl'?-8:8});end.prop.x=actor==='girl'?260:1410;duration=3300;break;
  case 'apart':move(end,'girl',{x:275,head:-10});move(end,'boy',{x:1000,head:10});end.prop.opacity=.5;break;
  case 'rest':move(end,'girl',{head:5,y:158});move(end,'boy',{head:8,y:158});end.prop.x=600;break;
  case 'smile':move(end,'girl',{head:7});move(end,'boy',{head:-7});break;
  case 'nod':move(middle,actor,{head:10,y:161});via=middle;break;
  case 'pause':move(end,actor,{head:12});end.prop.y=665;duration=2600;break;
  case 'listen':move(end,other,{head:other==='girl'?6:-6});break;
 }
 if(cue.mode==='remote') {
  // Screen partitions must stay apart whatever the selected response is.
  for(const p of [start,middle,end]){p.girl.x=270;p.boy.x=1010;p.girl.y=p.boy.y=160;p.prop.x=actor==='girl'?535:1180;p.prop.y=575;}
 }
 const frames=via?[start,via,end]:[start,end];
 if(from){
  frames[0]=copy(from);
  if(cue.mode==='remote'){frames[0].girl.x=270;frames[0].boy.x=1010;frames[0].girl.y=frames[0].boy.y=160;frames[0].prop.x=actor==='girl'?535:1180;frames[0].prop.y=575;}
 }
 const detailed=detailedTimeline(cue,frames[0]);
 if(detailed&&cue.mode==='remote')for(const p of detailed.frames){
  p.girl.x=270;p.boy.x=1010;p.girl.y=p.boy.y=160;p.prop.x=actor==='girl'?535:1180;p.prop.y=575;
 }
 return detailed??{duration,frames};
}

export function sampleTimeline(timeline,progress) {
 const p=Math.min(1,Math.max(0,progress));
 if(p===1)return copy(timeline.frames.at(-1));
 const scaled=p*(timeline.frames.length-1);
 const index=timeline.stops?timeline.stops.findIndex((stop,i)=>i<timeline.stops.length-1&&p>=stop&&p<timeline.stops[i+1]):Math.min(timeline.frames.length-2,Math.floor(scaled));
 const t=timeline.stops?(p-timeline.stops[index])/(timeline.stops[index+1]-timeline.stops[index]):scaled-index;
 const eased=t*t*(3-2*t),a=timeline.frames[index],b=timeline.frames[index+1];
 return Object.fromEntries(Object.keys(a).map(part=>[part,Object.fromEntries(Object.keys(a[part]).map(key=>[key,a[part][key]+(b[part][key]-a[part][key])*eased]))]));
}
