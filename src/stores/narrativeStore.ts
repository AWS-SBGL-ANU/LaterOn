// @ts-nocheck
import { defineStore } from 'pinia';
import { shallowRef,ref,computed } from 'vue';
import story from '../data/story.json';
import { newGame,advance,choose,current,validateSave } from '../domain/engine.mjs';
import { SaveRepository,SaveConflict } from '../services/saveRepository.mjs';
export {story};
export const useNarrativeStore=defineStore('narrative',()=>{
 const state=shallowRef<any>(null),error=ref(''),conflict=ref(false),canContinue=ref(false),endings=ref<string[]>([]);
 let repository:any;
 try{repository=new SaveRepository(window.localStorage,story);endings.value=repository.endings();canContinue.value=!!repository.load();}catch(e){error.value=e.message?.includes('不兼容')?'故事已更新，新增了相处片段。请翻开新故事；已经读过的结局仍会留着。':'暂时无法读取本地存档。你仍可开始故事并导出进度。';}
 const node=computed(()=>state.value?story.nodes[state.value.nodeId]:null),beat=computed(()=>state.value?current(state.value):null);
 function persist(){try{if(!repository)throw Error('浏览器存储不可用。');repository.save(state.value);canContinue.value=true;error.value='';conflict.value=false;}catch(e){conflict.value=e instanceof SaveConflict;error.value=e.message||'自动保存失败，请导出进度。';}}
 function start(){if(!repository)try{repository=new SaveRepository(window.localStorage,story);}catch{};repository?.fork();state.value=newGame(story);persist();}
 function resume(){try{state.value=repository.load();if(!state.value)throw Error('这里还没有存档。');error.value='';conflict.value=false;}catch(e){error.value=e.message;}}
 function update(fn){if(!state.value)return;const next=structuredClone(state.value);if(fn(story,next)){state.value=next;persist();if(next.phase==='completed'){try{repository.unlock(next.nodeId);endings.value=repository.endings();}catch{error.value='结局已读完，但记录保存失败。可以导出进度。';}}}}
 function next(){update(advance);}function select(id:string){update((story,s)=>choose(story,s,id));}
 function rewind(index:number){const checkpoint=state.value.checkpoints[index];if(!checkpoint)return;const history=state.value.checkpoints.slice(0,index+1);repository?.fork();state.value={...structuredClone(checkpoint),checkpoints:structuredClone(history)};persist();}
 function importSave(text:string){try{const data=validateSave(story,JSON.parse(text));repository?.fork();state.value=data;persist();if(data.phase==='completed'&&repository){try{repository.unlock(data.nodeId);endings.value=repository.endings();}catch{error.value='存档已导入，但回忆记录保存失败。';}}}catch(e){error.value=e.message;}}
 function fork(){repository?.fork();persist();}
 window.addEventListener('storage',event=>{if(event.key===repository?.key()&&state.value){conflict.value=true;error.value='另一个标签页更新了存档。继续前请选择重新载入或另存。';}else if(!state.value){try{canContinue.value=!!repository?.load();}catch{}}});
 return{state,node,beat,error,conflict,canContinue,endings,start,resume,next,select,rewind,importSave,fork,persist};
});
