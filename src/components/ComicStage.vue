<script setup lang="ts">
import { computed } from 'vue';
const props=defineProps<{node:any;facts:any;art:{id:string;key?:string;url:string;position:string;size:string};simple?:boolean;choice?:string}>();
const caption=computed(()=>{
 if(props.node.id==='E01')return props.facts.living==='together'?'两个人的日常，慢慢安放。':'今天带来的菜，还放在门边。';
 if(props.node.id==='E04'&&props.facts.notebookReturned)return '那本笔记，已经好好寄回去了。';
 if(props.node.id==='B11'&&props.choice==='A')return '两个月后，约好的日子。';return '';
});
</script>
<template>
 <div class="comic-stage" :class="{'simple-art':simple}" role="img" :aria-label="`${node.title}的粗铅笔淡彩手绘场景`">
  <div v-if="!simple" class="shot-panel" aria-hidden="true">
   <div class="scene-art" :style="{backgroundImage:`url(${art.url})`,backgroundPosition:art.position,backgroundSize:art.size}"></div>
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
