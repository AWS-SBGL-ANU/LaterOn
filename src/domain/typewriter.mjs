export function createTypewriter(onChange, {schedule=setTimeout, cancel=clearTimeout, interval=48}={}) {
 let characters=[], visible=0, timer=null, paused=false;
 const publish=()=>onChange(characters.slice(0,visible).join(''),visible<characters.length);
 function stop(){if(timer!==null)cancel(timer);timer=null;}
 function tick(){timer=null;if(paused)return;visible=Math.min(visible+1,characters.length);publish();queue();}
 function queue(){if(!paused&&visible<characters.length&&timer===null)timer=schedule(tick,interval);}
 return {
  start(text,instant=false){stop();characters=Array.from(text);visible=instant?characters.length:0;publish();queue();},
  finish(){stop();visible=characters.length;publish();},
  pause(value){paused=value;if(paused)stop();else queue();},
  dispose:stop
 };
}
