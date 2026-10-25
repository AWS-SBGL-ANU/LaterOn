<script setup lang="ts">
import atlas from '../data/armSegments.json';
import {artStyle} from '../data/artStyle.mjs';
import {armLengths,segmentArtworkTransform} from '../domain/rigGeometry.mjs';
defineProps<{who:string;arm:any;mirror?:boolean}>();
const crops:Record<string,number[]>=atlas.crops;
const sheet=`${import.meta.env.BASE_URL}${artStyle.arms}`;
</script>
<template>
 <g class="connected-arm">
  <g :transform="`translate(${arm.shoulder.x} ${arm.shoulder.y}) rotate(${arm.upperAngle})`">
   <g :transform="segmentArtworkTransform(`${who}-upper`,crops[`${who}-upper`][2],crops[`${who}-upper`][3],armLengths.upper)"><svg x="0" y="0" :width="crops[`${who}-upper`][2]" :height="crops[`${who}-upper`][3]" :viewBox="crops[`${who}-upper`].join(' ')" overflow="hidden"><image :href="sheet" :width="atlas.width" :height="atlas.height" /></svg></g>
  </g>
  <g :transform="`translate(${arm.elbow.x} ${arm.elbow.y}) rotate(${arm.lowerAngle})`">
   <g :transform="segmentArtworkTransform(`${who}-lower`,crops[`${who}-lower`][2],crops[`${who}-lower`][3],armLengths.lower)"><svg x="0" y="0" :width="crops[`${who}-lower`][2]" :height="crops[`${who}-lower`][3]" :viewBox="crops[`${who}-lower`].join(' ')" overflow="hidden"><image :href="sheet" :width="atlas.width" :height="atlas.height" /></svg></g>
  </g>
 </g>
</template>
