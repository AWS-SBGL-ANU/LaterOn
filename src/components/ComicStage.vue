<script setup lang="ts">
import { computed,shallowRef,watch } from 'vue';
import { prepareArt } from '../services/assetManager';
const props=defineProps<{node:any;facts:any;art:{id:string;index:number;key?:string;url:string;position:string;size:string;individual?:boolean;width?:number;height?:number};simple?:boolean;choice?:string}>();
// New independent images use their complete canvas. Legacy sheets still crop
// one of nine panels and retain their native-size display until replaced.
const source=shallowRef<{url:string;width:number;height:number}|null>(null);
watch(()=>[props.art.url,props.simple] as const,async ([url,simple],_,onCleanup)=>{
 let active=true;onCleanup(()=>{active=false;});
 if(simple)return;
 try{
  const image=await prepareArt(url);
  if(active)source.value={url,width:image.naturalWidth,height:image.naturalHeight};
 }catch{ /* App owns the retry and simplified-picture controls. */ }
},{immediate:true});
const crop=computed(()=>{
 const size=source.value?.url===props.art.url?source.value:null;
 const width=size?.width??props.art.width??1672,height=size?.height??props.art.height??941;
 if(props.art.individual)return {x:0,y:0,width,height,sourceWidth:width,sourceHeight:height};
 const column=props.art.index%3,row=Math.floor(props.art.index/3);
 const x=Math.floor(column*width/3),y=Math.floor(row*height/3);
 return {x,y,width:Math.floor((column+1)*width/3)-x,height:Math.floor((row+1)*height/3)-y,sourceWidth:width,sourceHeight:height};
});
const caption=computed(()=>{
 if(props.node.id==='E01')return props.facts.living==='together'?'两个人的日常，慢慢安放。':'今天带来的菜，还放在门边。';
 if(props.node.id==='E04'&&props.facts.notebookReturned)return '那本笔记，已经好好寄回去了。';
 if(props.node.id==='B11'&&props.choice==='A')return '两个月后，约好的日子。';return '';
});
</script>
<template>
 <div class="comic-stage" :class="{'simple-art':simple,'individual-art':art.individual}" role="img" :aria-label="`${node.title}的粗蜡笔手绘场景`">
  <div v-if="!simple" class="shot-panel" aria-hidden="true">
   <svg class="scene-picture" :viewBox="`${crop.x} ${crop.y} ${crop.width} ${crop.height}`" :width="crop.width" :height="crop.height" :style="{'--shot-native-width':`${crop.width}px`}" :preserveAspectRatio="art.individual?'xMidYMid slice':'xMidYMid meet'" aria-hidden="true">
    <image :href="art.url" x="0" y="0" :width="crop.sourceWidth" :height="crop.sourceHeight" />
   </svg>
  </div>
  <div v-if="simple" class="simple-caption"><span>插画暂未显示</span><p>你可以继续阅读，或重试加载画面。</p></div>
  <div class="scene-corner" aria-hidden="true">✧</div>
  <p v-if="caption" class="art-caption">{{ caption }}</p>
  <div v-if="node.backgroundId==='BG02'" class="notebook-memory" aria-hidden="true">
   <svg viewBox="0 0 100 65"><path d="M5 8Q25 1 49 9Q74 2 96 8L92 59Q70 53 49 60Q25 54 8 59Z" fill="#fff8ea" stroke="#8b7367" stroke-width="1.5"/><path d="M49 9v51" fill="none" stroke="#c2ac91"/>
    <g v-if="facts.notebookReturned!==true" fill="none" stroke="#8b7367" stroke-width="1.5" stroke-linecap="round"><path d="M63 28l-3-8 9 4q8-3 13 0l7-5-1 11q6 12-10 14-17-1-15-16Z"/><path d="M69 31h1m10 0h1m-8 6q3 3 6-1m-10 9-1 6m7-6v6m7-6 2 6"/><path v-if="choice==='B'" d="m65 44-3 7m23-8 6 7m-17-4-3 7"/><path v-else-if="choice==='A'" d="M63 31q7-6 12 0 7-6 14 0m-16 0h3"/></g>
   </svg>
  </div>
 </div>
</template>
