<script setup lang="ts">
defineProps<{part:string;x:number;y:number;width:number;height:number}>();
// Hand measured transparent bounds: the generated sheet has generous uneven
// whitespace, so blindly dividing it into equal cells would clip hair and hands.
const crops:Record<string,string>={
 'girl-body':'57 0 250 345','boy-body':'416 0 235 221',
 'girl-leg-left':'79 344 111 86','girl-leg-right':'182 344 111 86',
 'boy-leg-left':'430 214 110 221','boy-leg-right':'536 214 111 221',
 'girl-head':'690 66 386 356','boy-head':'1077 55 371 366',
 'girl-eyes-closed':'0 731 378 355','boy-eyes-closed':'379 729 362 357',
 'girl-outer':'80 451 165 280','girl-inner':'410 451 290 277',
 'boy-inner':'755 449 289 278','boy-outer':'1197 449 178 282',
 pen:'839 750 208 294',icecream:'1144 737 263 307'
};
const sheet=`${import.meta.env.BASE_URL}art/puppets/parts.png`;
</script>
<template>
 <svg :x="x" :y="y" :width="width" :height="height" :viewBox="crops[part]" overflow="hidden" aria-hidden="true"><image :href="sheet" width="1448" height="1086" /></svg>
</template>
