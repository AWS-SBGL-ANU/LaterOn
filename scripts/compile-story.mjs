import fs from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await fs.readFile(new URL('Later_On_Architecture_Package/docs/SCENE_MANIFEST.json',root),'utf8'));
const script = await fs.readFile(new URL('Later_On_Architecture_Package/docs/STORY_SCRIPT.md',root),'utf8');
const sections = [...script.matchAll(/^## ([SBDEF]\d{2})｜([^\r\n]+)\r?\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)];
const selectors = {
 'S01 一起听':'S01:A','S01 问过歌名':'S01:B','S01 没一起听':'S01:C',
 'S04 A':'S04:A','S04 B':'S04:B','S04 C':'S04:C','S13 A':'S13:A','S13 B':'S13:B',
 '提前告知':'S07:A','约定考后说明':'S07:B','淡化过申请':'S07:C',
 '已谈清':'transparent','尚未谈清':'opaque',
 '可靠记录＝已兑现':'reliable','可靠记录＝欠一次修复':'pending','可靠记录＝反复失约':'unreliable',
 '从 S14':'previous:S14','从 B08':'previous:B08',
 '出发前':'era:high','大学期间':'era:university','毕业及之后':'era:adult-remote','已经同城':'era:adult-city',
 '失约后主动停止':'previous:B06','未来长期悬置':'previous:B09','再次隐瞒':'previous:B10','同城后仍失约':'previous:B11',
 '班主任画像':'S02:A','六条腿的猫':'S02:B','替她保密':'S02:C',
 '终于说出过':'F01:A','仍未说出':'F01:B'
};
function parseLine(raw, inherited) {
 let line=raw.trim().replace(/^\d+\.\s*/,'').replace(/^-\s*/,'');
 let when=inherited;
 const prefix=line.match(/^([^：【]+)：((?:小五|小梦|同学)：.*)$/);
 if(prefix && selectors[prefix[1]]) { when=selectors[prefix[1]]; line=prefix[2]; }
 const conditional=line.match(/^【(提前告知／兑现考后说明|淡化过申请)】(.*)$/);
 if(conditional){when=conditional[1]==='淡化过申请'?'S07:C':'disclosed';line=conditional[2];}
 const speech=line.match(/^(小五|小梦|同学)：(.+)$/);
 if(speech) return [{kind:'speech',speaker:speech[1],text:speech[2],...(when?{when}:{})}];
 const tagged=line.match(/^【([^】]+)】(.+)$/);
 if(!tagged)return [];
 const [_,tag,text]=tagged;
 let kind='narration',speaker='旁白';
 if(tag.startsWith('手机·')){kind='message';speaker=tag.slice(3);}
 else if(tag.startsWith('节目·')){kind='broadcast';speaker=tag.slice(3);}
 else if(tag.includes('小五心声')||tag.includes('小梦心声')){kind='thought';speaker=tag.includes('小梦')?'小梦':'小五';}
 else if(tag==='动作'||tag==='结局镜头'){kind='action';speaker='';}
 else if(tag==='时间字幕'){kind='time';speaker='';}
 else if(tag!=='旁白') return [];
 return [{kind,speaker,text,...(when?{when}:{})}];
}
function parseBlock(text, node, isResponse=false){
 const beats=[];let inherited,art;
 for(const raw of text.split(/\r?\n/)){
  const clean=raw.trim().replace(/^-\s*/,'');
  if(clean.startsWith('【分镜】')){art=clean.slice(4).trim();continue;}
  if(clean==='【共同回应】'){inherited=undefined;continue;}
  if(node==='S09' && /^(提前告知|约定考后说明|淡化过申请)：$/.test(clean)){inherited=selectors[clean.slice(0,-1)];continue;}
  if(clean.startsWith('【仅 S07')){inherited='S07:B';continue;}
  if(clean.startsWith('若透明问题已处理')){inherited='trusted';continue;}
  if(clean.startsWith('若仍有未处理')){inherited='untrusted';continue;}
  if(clean.startsWith('【选项'))inherited=undefined;
  if(clean.startsWith('【条件补句】')){beats.push({kind:'speech',speaker:'小五',text:'你那次也这么说。',when:'S05:B'});continue;}
  if(/^(班主任画像|六条腿的猫|替她保密|终于说出过|仍未说出)：/.test(clean)){
   const p=clean.indexOf('：'),when=selectors[clean.slice(0,p)];
   for(const part of clean.slice(p+1).split('／'))beats.push(...parseLine(part,when));
   continue;
  }
  beats.push(...parseLine(raw,inherited).map(beat=>{
   if(beat.kind==='action'&&/抱住|拥抱|回抱/.test(beat.text)&&['S10','B03','S13'].includes(node))art={S10:'airport-hug',B03:'bridge-hug',S13:'university-reunion'}[node];
   if(node==='S01'&&beat.kind==='action'&&/座位|耳机/.test(beat.text))art='school-listen';
   return {...beat,...(art?{art}:{})};
  }));
 }
 return beats.map((b,i)=>({...b,id:`${node}-${isResponse?'r':'d'}-${i}`}));
}
const nodes={};
for(const [,id,title,body] of sections){
 const meta=manifest.nodes.find(n=>n.id===id);if(!meta)continue;
 const choiceStarts=[...body.matchAll(/^【选项 ([ABC])】([^\r\n]+)/gm)];
 const first=choiceStarts[0]?.index??body.length;
 const preamble=body.slice(0,first);
 const choices=choiceStarts.map((m,i)=>{
  let responseText=body.slice(m.index+m[0].length,choiceStarts[i+1]?.index??body.length);
  responseText=responseText.split('【共同收尾】')[0].split('【末句·')[0];
  const ref=meta.choices.find(c=>c.id===m[1]);
  return {...ref,label:m[2].trim(),response:parseBlock(responseText,id,true)};
 });
 let tail=[];
 if(body.includes('【共同收尾】'))tail=parseBlock(body.split('【共同收尾】')[1].split('【条件回声】')[0],id,true);
 if(id==='E03')tail=[{id:'E03-tail',kind:'thought',speaker:'小五',text:'那天她问我的时候，其实我听懂了。'}];
 const time=(body.match(/^【时间】([^\r\n]+)/m)?.[1]??'').split('。')[0];
 nodes[id]={...meta,title,time,beats:parseBlock(preamble,id),choices,tail};
 if(!nodes[id].beats.length)throw Error('Empty node: '+id);
}
if(Object.keys(nodes).length!==manifest.counts.storyNodes)throw Error('Story node count does not match manifest');
await fs.mkdir(new URL('src/data',root),{recursive:true});
await fs.writeFile(new URL('src/data/story.json',root),JSON.stringify({version:'2.0.0',nodes},null,2));
console.log(`Compiled ${Object.keys(nodes).length} nodes; ${Object.values(nodes).reduce((n,x)=>n+x.beats.length+x.choices.reduce((a,c)=>a+c.response.length,0)+x.tail.length,0)} dialogue beats.`);
