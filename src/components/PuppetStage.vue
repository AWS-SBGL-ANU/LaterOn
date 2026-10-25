<script setup lang="ts">
import {ref,shallowRef,watch,nextTick,onMounted,onUnmounted,getCurrentInstance} from 'vue';
import PuppetPart from './PuppetPart.vue';
import StoryProp from './StoryProp.vue';
import {timelineFor,sampleTimeline} from '../domain/puppetTimeline.mjs';
import {momentAt} from '../domain/detailedMovements.mjs';
const props=defineProps<{cue:any;from?:any;paused?:boolean;reduced?:boolean}>();
const paper=ref<SVGSVGElement|null>(null);
const moment=shallowRef<any>(null),maskId=`puppet-joints-${getCurrentInstance()!.uid}`;
let timeline=timelineFor(props.cue,props.from),elapsed=0,lastTime:number|null=null,raf=0;
let joints=new Map<string,Element>();
function draw(){
 const progress=Math.min(1,elapsed/timeline.duration),pose=sampleTimeline(timeline,progress);
 const now=momentAt(timeline,progress);
 if(now!==moment.value)moment.value=now;
 for(const who of ['boy','girl']){
  const p=pose[who];
  joints.get(who)?.setAttribute('transform',`translate(${p.x} ${p.y}) rotate(${p.tilt} 170 550)`);
  joints.get(`${who}-head`)?.setAttribute('transform',`rotate(${p.head} 170 270)`);
  joints.get(`${who}-inner`)?.setAttribute('transform',`rotate(${p.inner} ${who==='girl'?235:110} 280)`);
  joints.get(`${who}-outer`)?.setAttribute('transform',`rotate(${p.outer} ${who==='girl'?92:250} 280)`);
  joints.get(`${who}-wrist`)?.setAttribute('transform',`rotate(${p.wrist??0} ${who==='girl'?350:0} 385)`);
  const walking=now?props.cue.mode!=='remote'&&now.moving.includes(who):props.cue.action==='leave'?who===props.cue.actor
   :['approach','sit-close'].includes(props.cue.action)?who==='girl':props.cue.action==='release';
  const legProgress=now?Math.max(0,Math.min(1,(progress-now.at)/(now.until-now.at))):progress;
  const stride=walking&&!props.reduced?Math.sin(legProgress*Math.PI*4)*12*Math.sin(legProgress*Math.PI):0;
  joints.get(`${who}-leg-left`)?.setAttribute('transform',`rotate(${stride} 135 ${who==='girl'?507:423})`);
  joints.get(`${who}-leg-right`)?.setAttribute('transform',`rotate(${-stride} 215 ${who==='girl'?507:423})`);
  const closed=(now?now.eyes==='both'||now.eyes===who:['lean','hug','embrace','rest','smile'].includes(props.cue.action)&&progress>.68)||(!props.reduced&&progress>.32&&progress<.36);
  joints.get(`${who}-open`)?.setAttribute('opacity',closed?'0':'1');
  joints.get(`${who}-closed`)?.setAttribute('opacity',closed?'1':'0');
 }
 const p=pose.prop;
 joints.get('prop')?.setAttribute('transform',`translate(${p.x} ${p.y}) rotate(${p.angle}) scale(${p.scale})`);
 joints.get('prop')?.setAttribute('opacity',String(p.opacity));
}
function stop(){cancelAnimationFrame(raf);raf=0;lastTime=null;}
function tick(time:number){
 if(props.paused||props.reduced){stop();return;}
 if(lastTime!==null)elapsed+=Math.min(64,time-lastTime);
 lastTime=time;draw();
 if(elapsed<timeline.duration)raf=requestAnimationFrame(tick);else stop();
}
function play(){stop();if(!props.paused&&!props.reduced&&elapsed<timeline.duration)raf=requestAnimationFrame(tick);}
function settleMotion(){
 if(elapsed>=timeline.duration)return true;
 elapsed=timeline.duration;stop();draw();return false;
}
function capturePose(){return sampleTimeline(timeline,Math.min(1,elapsed/timeline.duration));}
async function reset(){
 stop();await nextTick();if(!paper.value)return;
 joints=new Map([...paper.value.querySelectorAll('[data-rig]')].map(el=>[el.getAttribute('data-rig')!,el]));
 timeline=timelineFor(props.cue,props.from);elapsed=props.reduced||props.cue.settled?timeline.duration:0;draw();play();
}
watch(()=>props.cue.key,()=>void reset());
watch(()=>props.paused,()=>play());
watch(()=>props.reduced,value=>{if(value)settleMotion();else play();});
onMounted(()=>void reset());onUnmounted(stop);
defineExpose({settleMotion,capturePose});
</script>
<template>
 <svg ref="paper" class="puppet-stage" viewBox="0 0 1600 900" aria-hidden="true">
  <defs><clipPath :id="`${maskId}-sleeve`"><rect x="-100" y="240" width="580" height="145" /></clipPath><clipPath :id="`${maskId}-hand`"><rect x="-100" y="385" width="580" height="95" /></clipPath></defs>
  <g class="puppet-environment" fill="none" stroke="#b0a38e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".65">
   <path d="M220 802Q792 789 1380 805M277 812 1192 814" opacity=".3"/>
   <g v-if="['desk','table'].includes(cue.setting)"><path d="M225 647 1380 650 1377 686 225 681ZM268 682 263 812M1330 685 1334 814" fill="#e5d7be"/><path d="m310 659 122 2m521 2 213 1" opacity=".4"/></g>
   <g v-else-if="['bench','bus'].includes(cue.setting)"><path d="M265 501 1328 504 1329 564 266 561ZM269 577 1329 578 1332 616 269 615ZM258 726 1340 730 1340 754 257 752ZM310 754V810M1289 754V810" fill="#e4d8c3"/></g>
   <g v-if="cue.setting==='bus'"><path d="M53 144 254 143 252 478 55 476ZM65 156 241 155 240 460 66 461" fill="#e2ebea"/><path d="M70 309H238"/></g>
   <g v-if="cue.setting==='airport'"><path d="M1290 605Q1292 584 1320 584H1438Q1461 587 1460 609V795H1290ZM1330 584V479H1420V584M1340 479V464H1410V479M1315 805V817M1438 805V817" fill="#dfb7ad"/><path d="M1313 610V772M1437 612V774M142 542V795M130 542H155M142 555 312 556"/></g>
   <g v-if="cue.setting==='bridge'"><path d="M185 589 1415 592M185 629 1415 630M240 590V733M1360 592V733"/><path d="M223 839Q392 824 546 839T889 839T1261 839" stroke="#bac6c7"/></g>
   <path v-if="cue.setting==='outside'" d="M195 802 193 632M170 652Q127 608 161 586Q128 540 171 529Q174 490 207 502Q251 480 264 525Q301 537 278 572Q302 619 254 637Q234 668 197 648" fill="#dfe4cb"/>
  </g>
  <g v-if="cue.mode==='remote'" class="remote-frames" fill="none" stroke="#c8c5b5" stroke-width="3"><path d="M170 172Q169 149 190 149H677Q700 151 700 172V808H170ZM902 172Q902 150 924 150H1410Q1431 150 1431 175V808H902ZM793 225V750" stroke-dasharray="8 12"/></g>
  <g v-for="who in ['boy','girl']" v-show="cue.mode!=='solo'||who===cue.actor" :key="who" :data-rig="who">
   <g :data-rig="`${who}-leg-left`"><PuppetPart :part="`${who}-leg-left`" :x="who==='girl'?106:94" :y="who==='girl'?499:413" :width="who==='girl'?76:84" :height="who==='girl'?84:172" /></g>
   <g :data-rig="`${who}-leg-right`"><PuppetPart :part="`${who}-leg-right`" :x="who==='girl'?179:177" :y="who==='girl'?499:413" :width="who==='girl'?76:84" :height="who==='girl'?84:172" /></g>
   <g :data-rig="`${who}-outer`"><PuppetPart :part="`${who}-outer`" :x="who==='girl'?68:222" :y="270" :width="92" :height="180" /></g>
   <PuppetPart :part="`${who}-body`" :x="80" :y="244" :width="185" :height="who==='girl'?270:175" />
   <g :data-rig="`${who}-inner`">
    <g :clip-path="`url(#${maskId}-sleeve)`"><PuppetPart :part="`${who}-inner`" :x="who==='girl'?207:-72" :y="263" :width="210" :height="190" /></g>
    <g :data-rig="`${who}-wrist`"><g :clip-path="`url(#${maskId}-hand)`"><PuppetPart :part="`${who}-inner`" :x="who==='girl'?207:-72" :y="263" :width="210" :height="190" /></g></g>
   </g>
   <g :data-rig="`${who}-head`">
    <g :data-rig="`${who}-open`"><PuppetPart :part="`${who}-head`" :x="0" :y="0" :width="340" :height="304" /></g>
    <g :data-rig="`${who}-closed`" opacity="0"><PuppetPart :part="`${who}-eyes-closed`" :x="0" :y="0" :width="340" :height="304" /></g>
   </g>
   <g v-if="cue.era==='adult'" fill="#e8e6d5" stroke="#a4a795" stroke-width="2"><path d="m160 288 17 45 17-45M158 333H196V367H158Z"/><path d="M165 348H188"/></g>
  </g>
  <g v-if="!moment&&cue.action==='pour'" transform="translate(790 660) scale(.65)"><StoryProp kind="drink" /></g>
  <g v-if="!moment&&cue.setting==='bench'&&cue.object==='spoon'" transform="translate(600 650) scale(.85)"><StoryProp kind="icecream" /></g>
  <g v-for="(extra,i) in moment?.extras??[]" :key="i" :transform="`translate(${extra.x} ${extra.y}) rotate(${extra.angle??0}) scale(${extra.scale??1})`"><StoryProp :kind="extra.kind" /></g>
  <path v-if="moment?.pour" d="M800 574Q782 606 790 632" fill="none" stroke="#b8ced0" stroke-width="4" stroke-linecap="round" opacity=".7" />
  <g data-rig="prop"><StoryProp :kind="moment?.object??cue.object" :open="moment?.open" :loaded="moment?.loaded" /></g>
  <text v-if="moment" x="800" y="863" text-anchor="middle" class="action-moment">{{ moment.label }}</text>
 </svg>
</template>
