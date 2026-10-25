<script setup lang="ts">
import atlas from '../data/puppetParts.json';
import {artStyle} from '../data/artStyle.mjs';
defineProps<{part:string;x:number;y:number;width:number;height:number}>();
const crops:Record<string,number[]>=atlas.crops;
const sheet=`${import.meta.env.BASE_URL}${artStyle.puppet}`;
</script>
<template>
 <svg :x="x" :y="y" :width="width" :height="height" :viewBox="crops[part].join(' ')" :preserveAspectRatio="part.includes('body')||part.includes('-leg-')?'none':'xMidYMid meet'" overflow="hidden" aria-hidden="true"><image :href="sheet" :width="atlas.width" :height="atlas.height" /></svg>
</template>
