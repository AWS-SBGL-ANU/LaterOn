<script setup lang="ts">
import PuppetPart from './PuppetPart.vue';
defineProps<{kind:string;open?:boolean;loaded?:boolean}>();
</script>
<template>
 <g class="story-prop" fill="#fffbf1" stroke="#a2988a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity=".92">
  <PuppetPart v-if="kind==='pen'" part="pen" :x="-45" :y="-65" :width="90" :height="125" />
  <PuppetPart v-else-if="kind==='icecream'" part="icecream" :x="-58" :y="-70" :width="116" :height="135" />
  <g v-else-if="kind==='icecream-cup'"><path d="M-50-19Q0-35 51-18L39 61Q0 75-39 62Z" fill="#93897b"/><path d="M-50-19Q-68-41-44-51Q-49-79-24-76Q-13-98 10-80Q37-90 47-63Q74-54 51-18Q2-2-50-19Z" fill="#e3b5b0"/><path d="M-37-40 0-48 31-34M-27 11-23 43" stroke="#bd9691"/></g>
  <g v-else-if="kind==='coins'" fill="#d5c6a3"><ellipse cx="-18" cy="10" rx="24" ry="12"/><ellipse cx="20" cy="25" rx="22" ry="11"/><path d="M-16 2V18M17 18V31"/></g>
  <g v-else-if="kind==='coaster'"><ellipse rx="68" ry="22" fill="#d8c7aa"/><ellipse rx="51" ry="14" fill="none" stroke-dasharray="6 5"/></g>
  <g v-else-if="kind==='candy'"><path d="M-56-61 54-62 67 65Q0 85-67 65Z" fill="#e3d3b8"/><path d="M-49-45Q0-23 47-45M-33-13 0-24 33-10 31 30 0 43-31 28Z" fill="#d3b5ad"/><path d="M-31-10-48-22-45 9-31 16M33-10 47-23 46 9 32 18"/></g>
  <g v-else-if="kind==='bicycle'" fill="none"><circle cx="-155" cy="75" r="82"/><circle cx="155" cy="75" r="82"/><path d="M-155 75-62-61 34 75H-155L-30-34H103L155 75M34 75-7-88M-34-88H16M103-34 85-105 123-115" stroke-width="7"/></g>
  <g v-else-if="['notebook','application','calendar'].includes(kind)">
   <path d="M-96-55Q-49-65 0-51Q48-62 95-55L91 65Q47 53 0 66Q-49 54-92 64Z" fill="#f5edcf"/><path d="M0-51V66M-76-31L-19-33M-76-10L-25-12M-75 12L-20 11M20-30L73-30M20-8L70-9M21 14L74 13" opacity=".6"/>
   <g v-if="kind==='calendar'"><path d="M-71 32H73M-44 22V50M-13 24V51M19 23V51M49 22V51"/><path d="m17 30 8 8 17-21" stroke="#94a184"/></g>
   <path v-if="kind==='application'" d="M-21-41 0-49 24-42" stroke="#9cacae"/>
  </g>
  <g v-else-if="kind==='phone'"><path d="M-38-74Q-41-82-27-82H31Q40-82 40-72L38 73Q37 82 26 82H-28Q-40 80-39 70Z" fill="#666966"/><path d="M-30-60H30V57H-31Z" fill="#e7eee5"/><path d="M-21-35H20M-21-17H13M-21 2H21M-6 70H6" stroke="#afbca8"/></g>
  <g v-else-if="['water','bottle','drink','thermos'].includes(kind)">
   <path d="M-32-65Q0-78 33-66L32 65Q1 79-32 65Z" :fill="kind==='thermos'?'#a9b19c':'#dfebe3'"/><path d="M-32-65Q0-53 33-66M-30-52Q0-42 32-53M-20-18V39"/>
   <path v-if="kind==='water'" d="M59-41Q84-53 109-41V64Q84 76 59 64ZM60-26H108" fill="#dfebe3"/>
   <path v-if="kind==='thermos'&&!open" d="M-22-84H22L26-69H-26Z" fill="#889582"/>
  </g>
  <g v-else-if="['bag','breakfast','groceries'].includes(kind)"><path d="M-70-43Q-73-52-59-52H62L72 82Q0 94-72 80Z" :fill="kind==='bag'?'#727d78':'#dec5a1'"/><path d="M-27-51V-77Q1-108 29-77V-51" fill="none"/><path d="M-54-20-55 61M54-20 57 63" opacity=".5"/><path v-if="kind==='groceries'" d="M-22-48-35-98-16-88-4-108 8-87 28-101 22-48" fill="#adba92"/></g>
  <g v-else-if="kind==='umbrella'"><path d="M-290-340Q-244-486 0-500Q229-486 290-340Q209-379 148-340Q75-379 0-340Q-70-377-146-340Q-218-378-290-340Z" fill="#a3bbca"/><path d="M0-500V30Q1 58 26 47M0-500Q-101-451-146-340M0-500Q99-449 148-340" fill="none"/></g>
  <g v-else-if="kind==='earbuds'" fill="none"><path d="M-198-140Q-151-95-118-61Q-58-16 0 19Q45-24 110-71L182-138"/><path d="M-204-148Q-226-171-220-140Q-213-121-200-132ZM180-146Q202-167 203-141Q198-122 184-132Z" fill="#ede8dc"/></g>
  <g v-else-if="kind==='spoon'"><path d="M-10 72-4-23C-39-52-27-85 0-83C31-82 38-48 11-25L13 74Z"/><ellipse v-if="loaded" cy="-57" rx="20" ry="15" fill="#e5b8b1" stroke="#c8a19a"/></g>
  <g v-else-if="kind==='cap'"><path d="M-27-13Q0-27 28-13V16Q0 30-28 16Z" fill="#a3ac98"/><ellipse cy="-13" rx="28" ry="12"/></g>
  <g v-else-if="kind==='chopsticks'" fill="none" stroke="#ae926d" stroke-width="7"><path d="M-30 77 3-82M-7 79 28-79"/></g>
  <g v-else-if="kind==='tissue'"><path d="M-63-54 2-64 68-47 61 52-10 63-68 40Z"/><path d="m-45-35 43 8 41-13M-1-27-10 44" stroke="#d6ccba"/></g>
  <g v-else-if="kind==='star'"><path d="m0-65 20 41 47 7-34 33 8 47L0 41-42 63-33 16-66-17-20-24Z" fill="#b2c8d2"/><path d="m0-65 1 81 40 47M-66-17 1 16 67-17M-42 63 1 16" opacity=".45"/></g>
  <g v-else-if="kind==='eraser'"><path d="m-50-28 66-14 40 34-69 20-38-29V34l39 27 68-21V-8M-13 12V61" fill="#dbd2c1"/><path d="M-40-2 27-21 45-6-22 13Z" fill="#b5c8bd"/></g>
  <g v-else-if="kind==='keys'" fill="none"><circle cx="0" cy="-29" r="25"/><path d="M-12-9-33 61-16 66-9 43 4 45 11 23M14-9 34 61 53 53 44 34 53 29 43 9"/></g>
  <g v-else-if="kind==='ball'"><circle r="72" fill="#cead8b"/><path d="M-72 0H72M0-72V72M-53-49Q-3 0-53 49M53-49Q3 0 53 49" fill="none"/></g>
  <g v-else-if="kind==='microphone'"><path d="M-24-48Q0-84 26-48V5Q0 39-24 4ZM-36-11Q-40 49 0 47Q40 48 38-10M0 47V85M-25 85H26" fill="#a7b4b3"/></g>
  <g v-else-if="kind==='food'"><path d="M-90-8Q0 15 91-8L67 61Q0 82-66 60Z" fill="#d4c7ae"/><path d="M-89-8Q-4-39 91-8Q7 24-89-8ZM-36-32Q-51-58-32-74M0-29Q-17-58 4-83M37-31Q23-57 43-75" fill="none"/></g>
  <g v-else-if="kind==='tools'"><path d="m-65 49 75-77Q-4-70 28-73L24-44 45-34 63-52Q76-15 34-10L-41 66Z" fill="#a5aaa5"/></g>
  <g v-else-if="kind==='chair'" fill="#d0bda4"><path d="M-65-64H65V7H-65ZM-72 17H73V39H-72ZM-58 39V89M59 39V89"/></g>
 </g>
</template>
