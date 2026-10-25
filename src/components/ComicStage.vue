<script setup lang="ts">
import { computed,ref,shallowRef,watch } from 'vue';
import { motionFor } from '../domain/motion.mjs';
import PuppetStage from './PuppetStage.vue';
const props=defineProps<{node:any;facts:any;art:{id:string;key?:string;url:string;position:string;size:string;performance?:any};simple?:boolean;choice?:string;paused?:boolean;reduced?:boolean}>();
const puppet=ref<InstanceType<typeof PuppetStage>|null>(null);
const previousPose=shallowRef<any>(null);
watch(()=>[props.node.id,props.art.key],([nodeId],[previousNode])=>{
 previousPose.value=nodeId===previousNode?puppet.value?.capturePose()??null:null;
});
function settleMotion(){return puppet.value?.settleMotion()??true;}
defineExpose({settleMotion});
const motion=computed(()=>motionFor(props.art,props.node));
const raindrops=Array.from({length:18},(_,i)=>({x:i%2===0?35+(i%9)*24:1370+(i%9)*23,y:(i*137)%900,delay:`${-i*.19}s`}));
const caption=computed(()=>{
 if(props.node.id==='E01')return props.facts.living==='together'?'两个人的日常，慢慢安放。':'今天带来的菜，还放在门边。';
 if(props.node.id==='E04'&&props.facts.notebookReturned)return '那本笔记，已经好好寄回去了。';
 if(props.node.id==='B11'&&props.choice==='A')return '两个月后，约好的日子。';return '';
});
</script>
<template>
 <div class="comic-stage" :class="{'simple-art':simple,'motion-paused':paused,'motion-reduced':reduced}" role="img" :aria-label="`${node.title}的粗铅笔淡彩手绘场景`">
  <Transition name="shot-dissolve"><div v-if="!simple" :key="art.key??art.id" class="shot-panel" aria-hidden="true">
   <div class="shot-camera" :class="`camera-${art.performance?'still':motion.camera}`">
    <PuppetStage v-if="art.performance" ref="puppet" :cue="art.performance" :from="previousPose" :paused="paused" :reduced="reduced" />
    <div v-else class="scene-art" :style="{backgroundImage:`url(${art.url})`,backgroundPosition:art.position,backgroundSize:art.size}"></div>
    <svg v-if="motion.rain" class="sketch-rain" viewBox="0 0 1600 900" fill="none"><path v-for="(drop,i) in raindrops" :key="i" :d="`M${drop.x} ${drop.y}l-9 30`" :style="{animationDelay:drop.delay}" /></svg>
    <div v-if="motion.bus" class="bus-window-light"></div>
    <svg v-if="motion.steam" class="cup-steam" :style="{left:`${motion.steam.x}%`,top:`${motion.steam.y}%`}" viewBox="0 0 70 100" fill="none"><path d="M16 92C2 67 33 63 18 38S25 14 19 5"/><path d="M36 94C20 72 52 59 37 39S46 15 38 4"/><path d="M55 91C43 69 67 57 54 36S62 15 55 7"/></svg>
    <svg v-if="motion.heart" class="pencil-heart" viewBox="0 0 70 65" fill="none"><path d="M34 53C22 44 7 33 10 22C13 10 28 12 34 22C41 10 57 11 60 23C63 36 45 48 34 53Z"/><path d="M31 53C20 43 9 35 11 24"/></svg>
   </div>
  </div></Transition>
  <div v-if="simple" class="simple-caption"><span>插画暂未显示</span><p>你可以继续阅读，或重试加载画面。</p></div>
  <div class="scene-corner" aria-hidden="true">✧</div>
  <p v-if="caption" class="art-caption">{{ caption }}</p>
  <div v-if="node.backgroundId==='BG02'&&!art.performance" class="notebook-memory" aria-hidden="true">
   <svg viewBox="0 0 100 65"><path d="M5 8Q25 1 49 9Q74 2 96 8L92 59Q70 53 49 60Q25 54 8 59Z" fill="#fff8ea" stroke="#8b7367" stroke-width="1.5"/><path d="M49 9v51" fill="none" stroke="#c2ac91"/>
    <g v-if="facts.notebookReturned!==true" fill="none" stroke="#8b7367" stroke-width="1.5" stroke-linecap="round"><path d="M63 28l-3-8 9 4q8-3 13 0l7-5-1 11q6 12-10 14-17-1-15-16Z"/><path d="M69 31h1m10 0h1m-8 6q3 3 6-1m-10 9-1 6m7-6v6m7-6 2 6"/><path v-if="choice==='B'" d="m65 44-3 7m23-8 6 7m-17-4-3 7"/><path v-else-if="choice==='A'" d="M63 31q7-6 12 0 7-6 14 0m-16 0h3"/></g>
   </svg>
  </div>
 </div>
</template>
