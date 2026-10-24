import { reactive } from 'vue';
export { moodFor } from '../domain/music.mjs';
export type MusicMood='sunny'|'flutter'|'tender'|'distance'|'rain';
export const music=reactive({playing:false,title:'还没翻开故事',message:''});
const titles:Record<MusicMood,string>={sunny:'放学后的晴天',flutter:'比昨天近一点',tender:'杯盖里的热气',distance:'隔着一座城',rain:'没说完的晚安'};
let enabled=true,unlocked=false,mood:MusicMood='flutter',current:HTMLAudioElement|null=null,fade=0,run=0;
const players=new Set<HTMLAudioElement>();
function silence(){cancelAnimationFrame(fade);run++;for(const player of players)player.pause();music.playing=false;}
export function setSound(value:boolean){enabled=value;if(!value)silence();else if(unlocked)void play();}
export function setMusicMood(value:MusicMood){if(value===mood)return;mood=value;if(enabled&&unlocked)void play();}
export function unlockAudio(value:boolean){unlocked=true;enabled=value;if(value)void play();else silence();}
async function play(){
 const source=new URL(`${import.meta.env.BASE_URL}audio/${mood}.wav`,document.baseURI).href;
 if(current?.src===source&&!current.paused){music.title=titles[mood];return;}
 cancelAnimationFrame(fade);
 for(const player of players)if(player!==current){player.pause();players.delete(player);}
 const previous=current;
 const next=previous?.src===source?previous:new Audio(source);
 next.loop=true;next.preload='auto';next.volume=previous===next ? .45 : 0;players.add(next);current=next;
 const token=++run;music.title=titles[mood];music.message='';
 try{await next.play();if(token!==run||!enabled){next.pause();return;}music.playing=true;}
 catch{if(token===run){music.playing=false;music.message='轻点音乐按钮，即可重新播放配乐。';}return;}
 const started=performance.now(),from=previous?.volume??0;
 function blend(){
  if(token!==run)return;
  const p=Math.min(1,(performance.now()-started)/1200);next.volume=.45*p;
  if(previous&&previous!==next)previous.volume=from*(1-p);
  if(p<1)fade=requestAnimationFrame(blend);
  else if(previous&&previous!==next){previous.pause();players.delete(previous);}
 }
 if(previous===next)next.volume=.45;else blend();
}
window.addEventListener('pagehide',silence);
