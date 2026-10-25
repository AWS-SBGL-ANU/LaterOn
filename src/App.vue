<script setup lang="ts">
// @ts-nocheck
import { ref,computed,watch,nextTick,onMounted,onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useNarrativeStore,story } from './stores/narrativeStore';
import ComicStage from './components/ComicStage.vue';
import StoryDialogue from './components/StoryDialogue.vue';
import { places,chapterNames } from './data/art';
import { sceneArt,planAdvance,planChoice } from './domain/presentation.mjs';
import { artDependencies } from './domain/choreography.mjs';
import {artStyle} from './data/artStyle.mjs';
import { prepareArt } from './services/assetManager';
import { gesture,startGesture,stopGesture,requireGestureRelease } from './services/gestureService';
import { setSound,setMusicMood,moodFor,unlockAudio,music } from './services/audio';
const baseUrl=import.meta.env.BASE_URL;
const coverArt={url:`${baseUrl}${artStyle.cover}`,position:'center',size:'contain'};
const game=useNarrativeStore();const {state,node,beat,error,conflict,canContinue,endings}=storeToRefs(game);
const screen=ref('cover'),modal=ref(''),transition=ref(false),transitionText=ref(''),artError=ref(''),simpleArt=ref(false),loading=ref(false),toast=ref(''),font=ref(28),reduced=ref(false),sound=ref(true),fullscreen=ref(false),newPrompt=ref(false);
const dialogue=ref<InstanceType<typeof StoryDialogue>|null>(null);
const comic=ref<InstanceType<typeof ComicStage>|null>(null);
const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
const systemReduced=ref(motionPreference.matches),pageHidden=ref(document.hidden);
function syncMotionPreference(){systemReduced.value=motionPreference.matches;}
function syncVisibility(){pageHidden.value=document.hidden;}
const instantText=computed(()=>reduced.value||systemReduced.value);
const importInput=ref<HTMLInputElement|null>(null),dialog=ref<HTMLElement|null>(null);
const endingDescriptions:Record<string,string>={E01:'不必每一天都盛大。一起吃饭、商量明天，就是后来。',E02:'不是没发生。只是现在，不用再补了。',E03:'有些话，说出口与没说出口，会走向不同的后来。',E04:'认真说完再见，然后走进各自的生活。'};
const chapter=computed(()=>node.value?chapterNames[node.value.chapter]:'一段由你继续的故事');
const chapterIndex=computed(()=>{const c=node.value?.chapter??'chapter-1';return c==='epilogue'?5:Number(c.slice(-1));});
const completed=computed(()=>state.value?.phase==='completed');
const currentArt=computed(()=>state.value?sceneArt(node.value,state.value,baseUrl):null);
const memoryChoice=computed(()=>node.value?.id==='B11'?state.value?.decisions.B11:state.value?.decisions.S02);
let lastAction=-Infinity,lastFocus:HTMLElement|null=null,transitionToken=0,toastTimer:any;
let failedArtAction:'current'|'advance'|'choice'='current',failedChoice='';
function notify(text:string){toast.value=text;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.value='',3500);}
function command(fn:()=>void){if(transition.value||loading.value||performance.now()-lastAction<230)return;lastAction=performance.now();fn();requireGestureRelease();}
function prepareScene(art){return Promise.all(artDependencies(art,baseUrl).map(url=>prepareArt(url)));}
async function reveal(){
 loading.value=true;artError.value='';
 try{await prepareScene(currentArt.value);simpleArt.value=false;}catch(e){failedArtAction='current';artError.value='场景插画未能加载。你的剧情进度已保留。';}finally{loading.value=false;}
}
async function begin(){game.start();setMusicMood(moodFor(node.value,state.value));unlockAudio(sound.value);screen.value='story';newPrompt.value=false;await reveal();}
async function resume(){game.resume();if(state.value){setMusicMood(moodFor(node.value,state.value));unlockAudio(sound.value);screen.value='story';await reveal();}}
function toggleSound(){sound.value=!sound.value;unlockAudio(sound.value);}
function newStory(){if(state.value||canContinue.value){newPrompt.value=true;modal.value='new';}else void begin();}
async function advanceLine(skipArt=false){
 if(modal.value||transition.value||loading.value||artError.value||conflict.value||!state.value)return;
 if(!skipArt&&comic.value&&!comic.value.settleMotion())return;
 const sourceState=state.value;
 const plan=planAdvance(story,state.value,baseUrl);if(!plan)return;
 if(plan.artChanged&&!skipArt){
  loading.value=true;
  try{await prepareScene(plan.art);}catch{failedArtAction='advance';artError.value='下一幅插画未能加载。你可以重试，或选择简化画面继续。';return;}finally{loading.value=false;}
 }
 if(state.value!==sourceState||screen.value!=='story'||modal.value)return;
 if(plan.crossScene){
  const token=++transitionToken;transitionText.value=`${plan.node.time.split('。')[0]}\n${places[plan.node.backgroundId]}`;transition.value=true;requireGestureRelease();
  await delay(instantText.value?70:480);if(token!==transitionToken)return;
  if(state.value!==sourceState||screen.value!=='story'){transition.value=false;return;}
  game.next();simpleArt.value=skipArt;
  await delay(instantText.value?70:650);if(token===transitionToken)transition.value=false;return;
 }
 game.next();if(plan.artChanged)simpleArt.value=skipArt;
}
async function retryArt(){const action=failedArtAction;artError.value='';if(action==='advance')await advanceLine();else if(action==='choice')await applyChoice(failedChoice);else await reveal();}
async function continueWithoutArt(){const action=failedArtAction;artError.value='';if(action==='advance')await advanceLine(true);else if(action==='choice')await applyChoice(failedChoice,true);else simpleArt.value=true;}
const delay=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
async function applyChoice(id:string,skipArt=false){
 if(conflict.value||modal.value||transition.value||loading.value||artError.value||!state.value)return;
 const sourceState=state.value;
 const plan=planChoice(story,state.value,id,baseUrl);if(!plan)return;
 if(plan.artChanged&&!skipArt){
  loading.value=true;
  try{await prepareScene(plan.art);}catch{failedArtAction='choice';failedChoice=id;artError.value='这一镜插画未能加载。你的选择还没有提交，可以重试。';return;}finally{loading.value=false;}
 }
 if(state.value!==sourceState||screen.value!=='story'||modal.value)return;
 game.select(id);if(plan.artChanged)simpleArt.value=skipArt;
}
function choose(id:string){command(()=>void applyChoice(id));}
function advance(){command(()=>{if(modal.value||artError.value||conflict.value)return;dialogue.value?.revealOrAdvance();});}
function openModal(name:string){lastFocus=document.activeElement as HTMLElement;modal.value=name;requireGestureRelease();nextTick(()=>dialog.value?.querySelector<HTMLButtonElement>('button')?.focus());}
function closeModal(){modal.value='';requireGestureRelease();nextTick(()=>lastFocus?.focus());}
function goCover(){modal.value='';screen.value='cover';}
function exportSave(){if(!state.value)return;const blob=new Blob([JSON.stringify(state.value,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`后来呢-存档-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
async function importSave(event:Event){const file=(event.target as HTMLInputElement).files?.[0];if(!file)return;if(file.size>3e6){notify('存档文件过大。');return;}try{const text=await file.text();const before=state.value;game.importSave(text);if(state.value!==before){screen.value='story';closeModal();await reveal();}}catch{notify('无法读取这个存档。');}(event.target as HTMLInputElement).value='';}
function rewind(index:number){game.rewind(index);closeModal();void reveal();}
async function toggleFullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{notify('浏览器暂不支持全屏显示。');}}
function syncFullscreen(){fullscreen.value=!!document.fullscreenElement;}
function keydown(event:KeyboardEvent){
 if(modal.value){
  if(event.key==='Escape'){event.preventDefault();closeModal();return;}
  if(event.key==='Tab'){const items=[...dialog.value?.querySelectorAll<HTMLElement>('button:not(:disabled),input,select')??[]];const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}return;
 }
 if(event.key==='Escape'){openModal('menu');return;}
 if((event.key===' '||event.key==='Enter')&&screen.value==='story'&&!['BUTTON','INPUT','SELECT'].includes((event.target as HTMLElement).tagName)){event.preventDefault();if(!event.repeat)advance();}
}
watch(modal,async name=>{if(name){await nextTick();dialog.value?.querySelector<HTMLButtonElement>('button')?.focus();}});
watch([font,reduced,sound],()=>{try{localStorage.setItem('hou-lai-ne.settings',JSON.stringify({font:font.value,reduced:reduced.value,sound:sound.value,musicVersion:2}));}catch{}setSound(sound.value);});
watch(()=>[node.value?.id,state.value?.phase,state.value?.decisions[state.value?.nodeId]],()=>setMusicMood(moodFor(node.value,state.value)));
watch(()=>state.value?.phase,()=>requireGestureRelease());
// Prepare the actual next shot, including conditional choice responses. The
// presentation planner works on a copy and cannot advance the player's save.
watch(()=>[state.value?.nodeId,state.value?.phase,state.value?.index],()=>{
 if(!state.value||state.value.phase==='completed')return;
 const plans=state.value.phase==='choosing'
  ?node.value.choices.map(choice=>planChoice(story,state.value,choice.id,baseUrl))
  :[planAdvance(story,state.value,baseUrl)];
 for(const url of new Set(plans.filter(Boolean).flatMap(plan=>artDependencies(plan.art,baseUrl))))void prepareArt(url).catch(()=>{});
});
onMounted(()=>{try{const v=JSON.parse(localStorage.getItem('hou-lai-ne.settings')||'{}');if([24,28,32].includes(v.font))font.value=v.font;reduced.value=v.reduced===true;if(v.musicVersion===2)sound.value=v.sound!==false;}catch{}document.addEventListener('keydown',keydown);document.addEventListener('fullscreenchange',syncFullscreen);document.addEventListener('visibilitychange',syncVisibility);motionPreference.addEventListener('change',syncMotionPreference);void prepareArt(coverArt.url).catch(()=>{});});
onUnmounted(()=>{document.removeEventListener('keydown',keydown);document.removeEventListener('fullscreenchange',syncFullscreen);document.removeEventListener('visibilitychange',syncVisibility);motionPreference.removeEventListener('change',syncMotionPreference);clearTimeout(toastTimer);transitionToken++;stopGesture();setSound(false);});
</script>

<template>
 <div class="app-shell" :class="{'reduce-motion':instantText,'is-playing':screen==='story'}" :style="{'--dialogue-size':`${font}px`}">
  <header class="topbar" :inert="!!modal||transition">
   <button class="wordmark" aria-label="回到故事封面" @click="screen==='cover'?null:openModal('menu')"><span class="logo-scribble">♡</span> 后来呢<span class="logo-dot">✦</span></button>
   <span class="top-caption">{{ screen==='cover'?'小五与小梦的互动漫画':chapter }}</span>
   <div class="header-actions">
    <button class="quiet icon-button" :aria-label="sound?'关闭配乐':'开启配乐'" :title="sound?`正在听 · ${music.title}`:'开启配乐'" @click="toggleSound">{{ sound?'♫':'♩' }}</button>
    <button class="quiet icon-button fullscreen" :aria-label="fullscreen?'退出全屏':'进入全屏'" @click="toggleFullscreen">⛶</button>
    <button class="quiet" @click="openModal('settings')">设置 <span aria-hidden="true">☷</span></button>
   </div>
  </header>

  <main v-if="screen==='cover'" class="cute-cover" :inert="!!modal||transition">
   <div class="cover-stickers" aria-hidden="true"><span>✦</span><span>♡</span><span>✿</span><span>✦</span></div>
   <section class="cute-cover-picture"><h1 class="visually-hidden">后来呢 · 慢慢靠近，慢慢喜欢。</h1><div class="cover-sketch" role="img" aria-label="后来呢，慢慢靠近，慢慢喜欢。标题绘在封面左侧，小梦和小五在右侧的小长椅上分享冰淇淋，周围是暖白留白。" :style="{backgroundImage:`url(${coverArt.url})`,backgroundPosition:coverArt.position,backgroundSize:coverArt.size}"></div><span class="cover-charm">小五 × 小梦 <i>♡</i></span></section>
   <div class="cute-cover-controls"><p class="cover-invitation">一支借来的笔，一口没吃完的冰淇淋。<br><span>那些没说出口的喜欢，后来呢？</span></p><div class="cover-buttons"><button class="button primary" @click="command(newStory)">翻开故事 <span>♡</span></button><button v-if="canContinue" class="button secondary" @click="command(()=>void resume())">接着上次 <span>↝</span></button><button class="button memory-button" @click="openModal('memories')">回忆小盒子 <span>✿</span></button></div><button class="text-button how-to" @click="openModal('help')">第一次见面？怎么玩呀 ♡</button><p class="cover-music-note">♫ 轻点翻开，让配乐陪你慢慢读</p></div>
  </main>

  <main v-else-if="state&&node" class="reader" :inert="!!modal||transition">
   <div class="reader-heading"><div class="chapter-tag"><span class="eyebrow">{{ chapter }}</span><h1>{{ completed?'故事，先写到这里。':node.title }}</h1></div><div class="reader-meta"><span class="location-dot"></span>{{ places[node.backgroundId] }}<span class="chapter-markers" aria-label="章节进度"><i v-for="n in 5" :key="n" :class="{active:n<=chapterIndex}"></i></span></div></div>
   <div class="stage-slot"><div class="stage-frame">
    <ComicStage ref="comic" :node="node" :facts="state.facts" :art="currentArt" :simple="simpleArt" :choice="memoryChoice" :paused="!!modal||transition||loading||!!artError||conflict||pageHidden" :reduced="instantText" />
    <div class="scene-top-wash" aria-hidden="true"></div>
    <span class="paper-binding" aria-hidden="true"></span>
    <div class="stage-stamp">{{ node.time.split('。')[0] }}</div>
    <button v-if="!completed&&state.phase!=='choosing'&&beat" class="scene-advance-hit" aria-label="点击画面，显示整句或继续对白" :disabled="transition||loading||!!artError||conflict" @click.stop="advance"></button>
    <StoryDialogue v-if="!completed&&state.phase!=='choosing'&&beat" ref="dialogue" :beat="beat" :boy-side="currentArt.boySide" :line-key="`${state.nodeId}:${state.phase}:${state.index}`" :paused="!!modal||transition||loading||!!artError||conflict" :instant="instantText" @interact="advance" @advance="advanceLine()" />
    <Transition name="choices-rise"><section v-if="!completed&&state.phase==='choosing'" class="scene-choices" aria-label="选择你的回应"><div class="choice-heading"><span>这一刻，你想怎么说？</span><small>慢慢想，不着急 ♡</small></div><div class="choices"><button v-for="(choice,index) in node.choices" :key="`${node.id}-${choice.id}`" class="choice-button" :disabled="loading||transition||conflict||!!artError" @click.stop="choose(choice.id)"><span class="choice-letter">{{ String(index+1).padStart(2,'0') }}</span><span>{{ choice.label }}</span><span class="choice-arrow">↗</span></button></div></section></Transition>
    <section v-if="completed" class="ending-card scene-ending"><span class="eyebrow">这一段后来 · 已读完</span><h2>{{ node.title }}</h2><p>{{ endingDescriptions[node.id] }}</p><div><button class="button primary" @click="openModal('journey')">回看这一路 <span>↗</span></button><button class="button secondary" @click="openModal('new')">再写一种后来 <span>→</span></button><button class="text-button" @click="goCover">回到封面</button></div></section>
    <div v-if="loading" class="loading-pill" role="status"><span class="spinner"></span> 正在翻到下一页…</div>
    <div v-if="artError" class="asset-error" role="alert"><p>{{ artError }}</p><button class="button primary" @click="retryArt">重试插画</button><button class="button secondary" @click="continueWithoutArt">先用简化画面继续</button></div>
   </div></div>
   <footer class="reader-toolbar"><span class="save-indicator" :class="{warning:error}"><i></i>{{ error?'进度保留在当前页面':'进度自动保存' }}</span><div><button class="text-button" @click="openModal('backlog')">▤ 对白记录</button><button class="text-button" @click="openModal('journey')">↶ 这一路</button><button class="text-button" @click="openModal('menu')">☰ 暂停</button></div></footer>
  </main>

  <footer v-if="screen==='cover'" class="site-footer" :inert="!!modal||transition"><span>后来呢 · 小小的选择，长长的故事。</span><button class="text-button" @click="openModal('credits')">关于这本故事</button></footer>
  <div v-if="error" class="save-error" role="alert"><span>{{ error }}</span><button v-if="conflict" @click="resume">重新载入</button><button v-if="conflict" @click="game.fork()">另存进度</button><button v-if="state" @click="exportSave">导出存档</button></div>
  <div v-if="toast" class="toast" role="status">{{ toast }}</div>

  <div v-if="modal" class="modal-backdrop" @click.self="closeModal"><section ref="dialog" class="modal" :class="{'wide-modal':['backlog','journey'].includes(modal)}" role="dialog" aria-modal="true" :aria-label="{settings:'阅读设置',help:'怎么玩',menu:'暂停',memories:'已读回忆',new:'新的故事',journey:'这一路',backlog:'对白记录',credits:'关于故事'}[modal]">
   <button class="modal-close icon-button" aria-label="关闭窗口，回到原来的进度" @click="closeModal">×</button>
   <template v-if="modal==='settings'"><span class="eyebrow">让阅读舒服一点</span><h2>按你的节奏。</h2><p class="font-sample">后来呢，慢慢喜欢你 ♡</p><div class="setting-row"><div><strong>对白字号</strong><p>圆圆的字，慢慢地说。</p></div><div class="segmented"><button v-for="size in [24,28,32]" :key="size" :class="{selected:font===size}" @click="font=size">{{ size }}</button></div></div><div class="setting-row"><div><strong>减少动态效果</strong><p>直接显示整句，缩短转场。</p></div><button class="toggle" role="switch" :aria-checked="reduced" :class="{on:reduced}" aria-label="减少动态效果" @click="reduced=!reduced"><i></i></button></div><div class="setting-row"><div><strong>让音乐陪着你</strong><small>{{ music.message || (music.playing ? `正在听 · ${music.title}` : `翻开故事后开始播放`) }}</small><p>轻快、心动、温柔、想念与失落。</p></div><button class="toggle" role="switch" :aria-checked="sound" :class="{on:sound}" aria-label="剧情配乐" @click="toggleSound"><i></i></button></div><div class="setting-row gesture-setting"><div><strong>用手势翻页</strong><p>食指移动，拇指与食指捏合点击。</p><small>{{ gesture.message }}</small></div><button class="button secondary small-button" :disabled="gesture.loading" @click="gesture.enabled?stopGesture():startGesture()">{{ gesture.loading?'正在开启…':gesture.enabled?'关闭手势':'开启手势' }}</button></div><p class="privacy-note">摄像头只在你主动开启后使用，画面在本机识别，不录制、不上传。鼠标始终可用。</p><button class="button primary full-button" @click="closeModal">回到故事 <span>↗</span></button></template>
   <template v-else-if="modal==='help'"><span class="eyebrow">不用着急</span><h2>一句，一句地读。</h2><ol class="help-list"><li><strong>头顶的气泡，会慢慢说完。</strong><p>点击可显示整句，再点击继续。空格或 Enter 也可以。</p></li><li><strong>在画面下方，选你想说的话。</strong><p>没有倒计时，也没有好感分数。</p></li><li><strong>随时回来，接着读。</strong><p>进度自动保存；设置里可调字号、关闭逐字效果或开启手势。</p></li></ol><button class="button primary full-button" @click="closeModal">知道了 <span>↗</span></button></template>
   <template v-else-if="modal==='menu'"><span class="eyebrow">故事会等你</span><h2>歇一会儿。</h2><div class="menu-list"><button class="button primary" @click="closeModal">继续阅读 <span>→</span></button><button class="button secondary" @click="modal='settings'">阅读设置</button><button class="button secondary" @click="exportSave">导出当前存档</button><button class="button secondary" @click="importInput?.click()">导入存档</button><button class="text-button" @click="goCover">回到封面</button></div></template>
   <template v-else-if="modal==='new'"><span class="eyebrow">另一种可能</span><h2>从第一句话开始？</h2><p class="modal-description">这次会开启独立的新进度。已经读完的结局仍会保留。</p><p v-if="state" class="muted">想留住现在这一刻，可以先导出存档。</p><div class="menu-list"><button class="button primary" @click="()=>{closeModal();void begin();}">开始新的故事 <span>↗</span></button><button v-if="state" class="button secondary" @click="exportSave">先导出当前存档</button><button class="text-button" @click="closeModal">先不翻篇</button></div></template>
   <template v-else-if="modal==='backlog'"><span class="eyebrow">刚才说过的话</span><h2>对白记录</h2><div class="backlog"><p v-if="!state?.history.length" class="muted">读过的话，会慢慢留在这里。</p><div v-for="(line,i) in state?.history" :key="i" class="log-line" :class="{narrator:!line.speaker||line.speaker==='旁白'}"><span>{{ line.speaker||'这一刻' }}{{ line.kind==='message'?' · 消息':'' }}</span><p>{{ line.text }}</p></div></div></template>
   <template v-else-if="modal==='journey'"><span class="eyebrow">只属于这次的选择</span><h2>回头看看，这一路。</h2><p class="muted">从某个选择重新开始，会另存一条分支；之后的经历会重新发生。</p><div class="journey-list"><div v-for="(point,i) in state?.checkpoints" :key="i" class="journey-item"><span class="journey-index">{{ String(i+1).padStart(2,'0') }}</span><div><strong>{{ story.nodes[point.nodeId].title }}</strong><p>{{ story.nodes[point.nodeId].choices.find(c=>c.id===state.decisions[point.nodeId])?.label||'还没有作出选择' }}</p></div><button class="text-button" @click="rewind(i)">从这里重选 ↗</button></div></div></template>
   <template v-else-if="modal==='memories'"><span class="eyebrow">那些已经走过的后来</span><h2>留在这里的回忆。</h2><div class="memory-grid"><div v-for="id in ['E01','E02','E03','E04']" :key="id" class="memory-card" :class="{unread:!endings.includes(id)}"><span>{{ endings.includes(id)?'✿':'✧' }}</span><h3>{{ endings.includes(id)?story.nodes[id].title:'还没翻到的后来' }}</h3><p>{{ endings.includes(id)?endingDescriptions[id]:'故事留着下一次相见。' }}</p></div></div><button class="text-button" @click="importInput?.click()">导入以前导出的存档 ↗</button></template>
   <template v-else><span class="eyebrow">关于这本故事</span><h2>后来呢。</h2><p class="modal-description">小五与小梦，从校园到成年，学习怎样表达、怎样守约，也学习怎样告别。</p><p class="modal-description">这是一段由你选择回应的 Q 版手绘互动漫画。故事包含四种结局，选择没有分数，也不必每一次都完美。</p><p class="muted">插画由 AI 辅助生成。故事与制作方向由项目剧本和已确认的美术规范确定。手势识别使用 MediaPipe。</p></template>
  </section></div>
  <input ref="importInput" class="visually-hidden" type="file" accept=".json,application/json" tabindex="-1" aria-label="选择要导入的存档" @change="importSave">
  <Transition name="fade"><div v-if="transition" class="transition-screen" role="status"><span>后来呢</span><p>{{ transitionText }}</p><i></i></div></Transition>
  <div v-if="gesture.enabled&&gesture.tracked" class="gesture-cursor" :class="{pinched:gesture.pinched}" :style="{left:`${gesture.x}px`,top:`${gesture.y}px`}" aria-hidden="true"><i></i></div>
  <div v-if="gesture.enabled&&!gesture.tracked" class="tracking-status" role="status">把手放进摄像头画面 · 鼠标仍可操作</div>
 </div>
</template>
