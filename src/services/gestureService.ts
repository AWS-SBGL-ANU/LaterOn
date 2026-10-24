import { reactive } from 'vue';
export const gesture=reactive({enabled:false,loading:false,tracked:false,x:0,y:0,pinched:false,message:'未开启摄像头'});
let stream:MediaStream|null=null,worker:Worker|null=null,video:HTMLVideoElement|null=null,frame=0,busy=false,generation=0,latched=true,last=0,initialized=false;
export function stopGesture(){generation++;cancelAnimationFrame(frame);worker?.terminate();worker=null;stream?.getTracks().forEach(t=>t.stop());stream=null;if(video){video.srcObject=null;video.remove();video=null;}busy=false;initialized=false;Object.assign(gesture,{enabled:false,loading:false,tracked:false,pinched:false,message:'摄像头已关闭'});}
export async function startGesture(){
 if(gesture.loading||gesture.enabled)return;
 stopGesture();const run=++generation;Object.assign(gesture,{loading:true,message:'正在准备手势…'});
 try{
  if(!navigator.mediaDevices?.getUserMedia)throw Error('此浏览器无法启用摄像头，请使用鼠标继续。');
  stream=await navigator.mediaDevices.getUserMedia({video:{width:640,height:480,facingMode:'user'},audio:false});
  if(run!==generation){stream?.getTracks().forEach(t=>t.stop());return;}
  video=document.createElement('video');video.muted=true;video.playsInline=true;video.srcObject=stream;await video.play();
  if(run!==generation)return;
  worker=new Worker(`${import.meta.env.BASE_URL}mediapipe/hand-tracking-worker.js`);const root=new URL(import.meta.env.BASE_URL,document.baseURI);
  const timeout=setTimeout(()=>fail('手势模型加载超时，可重试或用鼠标继续。'),30000);
  function fail(message:string){clearTimeout(timeout);stopGesture();gesture.message=message;}
  worker.onerror=()=>fail('手势识别暂时不可用，鼠标仍可继续。');
  worker.onmessage=({data})=>{
   if(run!==generation)return;
   if(data.type==='ready'){clearTimeout(timeout);initialized=true;gesture.loading=false;gesture.enabled=true;gesture.message='食指移动 · 捏合点击';latched=true;loop();return;}
   if(data.type==='error'){fail('手势识别遇到问题，可重试或用鼠标继续。');return;}
   busy=false;const points=data.landmarks;
   if(!points){gesture.tracked=false;gesture.pinched=false;latched=true;return;}
   const first=!gesture.tracked;gesture.tracked=true;
   const px=Math.min(1,Math.max(0,((1-points[8].x)-.1)/.8))*innerWidth,py=Math.min(1,Math.max(0,(points[8].y-.1)/.8))*innerHeight;
   gesture.x=first?px:gesture.x+(px-gesture.x)*.4;gesture.y=first?py:gesture.y+(py-gesture.y)*.4;
   const dist=(a:any,b:any)=>Math.hypot(a.x-b.x,a.y-b.y);
   const ratio=dist(points[4],points[8])/Math.max(.01,dist(points[5],points[17]));
   if(ratio>.48){latched=false;gesture.pinched=false;}
   if(ratio<.30&&!latched){latched=true;gesture.pinched=true;const button=document.elementFromPoint(gesture.x,gesture.y)?.closest('button');if(button instanceof HTMLButtonElement&&!button.disabled)button.click();}
  };
  worker.postMessage({type:'init',wasmUrl:new URL('mediapipe/wasm/',root).href,modelUrl:new URL('models/hand_landmarker.task',root).href});
 }catch(error){stopGesture();gesture.message=error instanceof DOMException&&error.name==='NotAllowedError'?'摄像头权限未允许，鼠标仍可继续。':'摄像头或手势无法启动，鼠标仍可继续。';}
}
async function loop(){
 if(!initialized||!video||!worker)return;
 frame=requestAnimationFrame(loop);if(busy||document.hidden||video.readyState<2||performance.now()-last<75)return;
 busy=true;last=performance.now();const run=generation;
 try{const bitmap=await createImageBitmap(video);if(run!==generation||!worker){bitmap.close();busy=false;return;}worker.postMessage({type:'frame',id:Math.floor(last),bitmap,timestamp:last,width:video.videoWidth,height:video.videoHeight},[bitmap]);}catch{busy=false;}
}
export function requireGestureRelease(){latched=true;}
window.addEventListener('pagehide',stopGesture);
