export const SCHEMA=1;
export const initialFacts=()=>({transparency:'unresolved',reliability:'untested',plan:false,relationship:'friends',era:'high',city:false,living:'separate',notebookReturned:false});
export function matches(when,s){
 if(!when)return true;
 const f=s.facts;
 if(when==='transparent')return f.transparency==='resolved';
 if(when==='opaque')return f.transparency!=='resolved';
 if(when==='disclosed')return s.decisions.S07!=='C';
 if(when==='reliable')return ['fulfilled','repaired'].includes(f.reliability);
 if(when==='pending')return f.reliability==='pending';
 if(when==='unreliable')return f.reliability==='unrepaired';
 if(when==='trusted')return f.transparency==='resolved'&&['fulfilled','repaired'].includes(f.reliability);
 if(when==='untrusted')return !matches('trusted',s);
 const [key,value]=when.split(':');
 if(key==='previous')return s.previous===value;
 if(key==='era')return value==='adult-city'?f.era==='adult'&&f.city:value==='adult-remote'?f.era==='adult'&&!f.city:f.era===value;
 return s.decisions[key]===value;
}
export function effects(s,id,choice){
 const f=s.facts;
 s.decisions[id]=choice;
 if(id==='S07')f.transparency=choice==='A'?'resolved':'unresolved';
 if(id==='S08'&&s.decisions.S07==='B')f.transparency='resolved';
 if((id==='S08'||id==='B01')&&choice==='A')f.relationship='couple';
 if(id==='B02'||id==='S13'&&choice==='A')f.transparency='resolved';
 if(id==='B03'&&choice==='B')f.transparency='unresolved';
 if(id==='B04'||id==='B05')f.reliability='fulfilled';
 if(id==='B06')f.reliability=choice==='A'?'pending':'unrepaired';
 if(id==='B07')f.reliability=choice==='B'?'unrepaired':'repaired';
 if((id==='B08'||id==='B09')&&choice==='A')f.plan=true;
 if(id==='B11'&&choice==='A'){f.transparency='resolved';f.reliability='repaired';}
 if(id==='D01'||id==='D02')f.relationship='ended';
 if(id==='D01'&&choice==='B')f.notebookReturned=true;
 if(id==='D03')f.living=choice==='A'?'together':'separate';
}
function routeCondition(c,f){
 if(!c)return true;
 if(c.all)return c.all.every(x=>routeCondition(x,f));
 if(c.any)return c.any.some(x=>routeCondition(x,f));
 return c.in?c.in.includes(f[c.fact]):f[c.fact]===c.equals;
}
export function targetFor(choice,s){return choice.routes?.find(r=>!r.otherwise&&routeCondition(r.when,s.facts))?.to??choice.routes?.find(r=>r.otherwise)?.to??null;}
export function enter(story,s,id){
 if(!story.nodes[id])throw Error('Unknown node '+id);
 const node=story.nodes[id];
 s.previous=s.nodeId??null;s.nodeId=id;
 if(['high','university','adult'].includes(node.ageStage))s.facts.era=node.ageStage;
 if(['S14','B08','B09','B10'].includes(id))s.facts.era='adult';
 if(['B11','D03','E01'].includes(id))s.facts.city=true;
 s.queue=node.beats.filter(b=>matches(b.when,s));s.index=0;s.phase='dialogue';s.next=null;
 s.visits.push(id);s.revision++;
}
export function newGame(story){
 const s={schemaVersion:SCHEMA,storyVersion:story.version,nodeId:null,previous:null,phase:'dialogue',queue:[],index:0,next:null,revision:0,facts:initialFacts(),decisions:{},history:[],visits:[],checkpoints:[]};
 enter(story,s,'S01');return s;
}
export function current(s){return s.queue[s.index]??null;}
function record(s){const beat=current(s);if(beat)s.history.push({...beat,nodeId:s.nodeId});}
export function advance(story,s){
 if(!['dialogue','response'].includes(s.phase))return false;
 record(s);s.revision++;
 if(s.index+1<s.queue.length){s.index++;return true;}
 if(s.phase==='dialogue'){s.phase='choosing';s.checkpoints.push({...snapshot(s),checkpoints:[]});return true;}
 if(s.next){enter(story,s,s.next);return true;}
 if(story.nodes[s.nodeId].endingId)s.phase='completed';
 return true;
}
export function choose(story,s,id){
 if(s.phase!=='choosing')return false;
 const n=story.nodes[s.nodeId],choice=n.choices.find(c=>c.id===id);if(!choice)return false;
 effects(s,n.id,id);
 const target=targetFor(choice,s);
 if(target==='B10'&&!s.facts.plan)throw Error('A shared plan is required');
 s.next=target;s.queue=[...choice.response,...(target?[]:n.tail)].filter(b=>matches(b.when,s));s.index=0;s.phase='response';s.revision++;
 if(!s.queue.length)throw Error('Choice response is missing');return true;
}
export function snapshot(s){return JSON.parse(JSON.stringify({...s,checkpoints:[]}));}
export function validateSave(story,data){
 validateProgress(story,data);
 if(!Array.isArray(data.checkpoints)||data.checkpoints.length>80)throw Error('存档重选记录无效。');
 for(const checkpoint of data.checkpoints){
  validateProgress(story,checkpoint);
  if(checkpoint.phase!=='choosing'||!Array.isArray(checkpoint.checkpoints)||checkpoint.checkpoints.length)throw Error('存档重选记录无效。');
 }
 return JSON.parse(JSON.stringify(data));
}
function validateProgress(story,data){
 if(!data||data.schemaVersion!==SCHEMA||data.storyVersion!==story.version)throw Error('存档版本与当前故事不兼容。');
 if(!story.nodes[data.nodeId]||!['dialogue','choosing','response','completed'].includes(data.phase))throw Error('存档进度无效。');
 if(!Number.isInteger(data.revision)||data.revision<0||!Number.isInteger(data.index)||!Array.isArray(data.queue)||data.index<0||data.index>=data.queue.length)throw Error('存档对白位置无效。');
 if(data.queue.length>100||!data.queue.every(b=>b&&typeof b.text==='string'&&b.text.length<1500&&['speech','action','narration','thought','message','broadcast','time'].includes(b.kind)))throw Error('存档对白数据无效。');
 if(!data.facts||typeof data.facts.plan!=='boolean'||!['resolved','unresolved'].includes(data.facts.transparency)||!['untested','fulfilled','pending','unrepaired','repaired'].includes(data.facts.reliability)||!['high','university','adult'].includes(data.facts.era))throw Error('存档关系记录无效。');
 if(!['friends','couple','ended'].includes(data.facts.relationship)||!['separate','together'].includes(data.facts.living)||typeof data.facts.city!=='boolean'||typeof data.facts.notebookReturned!=='boolean')throw Error('存档关系记录无效。');
 if(!data.decisions||Object.entries(data.decisions).some(([id,c])=>!story.nodes[id]?.choices.some(x=>x.id===c)))throw Error('存档选择记录无效。');
 if(data.next&&!story.nodes[data.next]||!Array.isArray(data.visits)||data.visits.some(x=>!story.nodes[x])||!Array.isArray(data.history)||data.history.length>10000)throw Error('存档历程无效。');
 if(data.previous!==null&&!story.nodes[data.previous]||data.history.some(b=>!b||!story.nodes[b.nodeId]||typeof b.text!=='string'||b.text.length>1500||typeof b.speaker!=='string'))throw Error('存档历程无效。');
 const node=story.nodes[data.nodeId],responding=['response','completed'].includes(data.phase);
 const choice=responding?node.choices.find(c=>c.id===data.decisions[data.nodeId]):null;
 if(responding&&!choice)throw Error('存档回应记录无效。');
 const expectedNext=responding?targetFor(choice,data):null;
 const expected=(responding?[...choice.response,...(expectedNext?[]:node.tail)]:node.beats).filter(b=>matches(b.when,data));
 if(data.next!==expectedNext||data.queue.length!==expected.length||data.queue.some((b,i)=>['id','text','kind','speaker','when','art'].some(key=>b[key]!==expected[i][key])))throw Error('存档对白与当前故事不一致。');
 if(['choosing','completed'].includes(data.phase)&&data.index!==data.queue.length-1||data.phase==='completed'&&(!node.endingId||data.next))throw Error('存档结束位置无效。');
}
