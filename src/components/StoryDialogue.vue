<script setup lang="ts">
import { computed,ref,watch,onUnmounted } from 'vue';
import { createTypewriter } from '../domain/typewriter.mjs';
const props=defineProps<{beat:any;lineKey:string;paused:boolean;instant:boolean;boySide?:string}>();
const emit=defineEmits<{interact:[];advance:[]}>();
const text=ref(''),typing=ref(false);
const writer=createTypewriter((value:string,active:boolean)=>{text.value=value;typing.value=active;});
const right=computed(()=>props.beat.speaker?.startsWith('小梦')?props.boySide!=='right':props.boySide==='right');
const narration=computed(()=>['action','narration','time'].includes(props.beat.kind));
const label=computed(()=>props.beat.kind==='thought'?`${props.beat.speaker} · 心声`:props.beat.kind==='message'?`${props.beat.speaker} · 消息`:props.beat.kind==='broadcast'?`${props.beat.speaker} · 节目`:narration.value?'这一刻':props.beat.speaker);
watch(()=>props.lineKey,()=>{writer.pause(props.paused);writer.start(props.beat.text,props.instant);},{immediate:true});
watch(()=>props.paused,value=>writer.pause(value));
watch(()=>props.instant,value=>{if(value)writer.finish();});
function revealOrAdvance(){if(typing.value)writer.finish();else emit('advance');}
defineExpose({revealOrAdvance});
onUnmounted(()=>writer.dispose());
</script>
<template>
 <button class="in-scene-bubble" :class="{right,narration,thought:beat.kind==='thought',message:beat.kind==='message',typing}" :disabled="paused" :aria-label="typing?'显示完整对白':'读完当前句，继续下一句'" @click.stop="emit('interact')">
  <span class="bubble-name"><i aria-hidden="true">{{ narration?'✧':beat.kind==='thought'?'☁':beat.kind==='message'?'✉':'✿' }}</i> {{ label }}</span>
  <span class="bubble-line" aria-hidden="true"><span class="bubble-copy bubble-measure">{{ beat.text }}</span><span class="bubble-copy bubble-ink">{{ text }}<i v-if="typing" class="typing-dot"></i></span></span>
  <span class="bubble-cue" aria-hidden="true">{{ typing?'轻点，显示整句':'轻点，继续' }} <span>{{ typing?'···':'▸' }}</span></span>
  <span class="visually-hidden" role="status" aria-live="polite">{{ label }}：{{ beat.text }}</span>
 </button>
</template>
