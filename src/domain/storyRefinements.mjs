// Compatible editorial fixes retain every beat ID and branch decision.
export const lineRefinements=[
 {id:'S01-r-4',from:'她用帽子给他让出半个座位。',to:'她把帽子挪到另一边，替两个人之间的耳机线腾出一点地方。'},
 {id:'S06-d-2',from:'她抬了抬伞柄，给他留出一点位置。',to:'他想起书包里还有把折伞。撑开以后，她接过伞柄，给他留出一点位置。'},
 {id:'S12-d-3',from:'她提前两天发来了节目时间。',to:'她又把节目时间贴在链接下面，特意换算成了他那边的时刻。'},
 {id:'S12-r-3',from:'他点进链接，先把耳机戴好，才回了那条说自己可能会念错的消息。',to:'他点开链接，确认节目结束后能听回放，才回了那条说自己可能会念错的消息。'}
];
function refineBeat(beat){
 const edit=lineRefinements.find(edit=>edit.id===beat?.id&&edit.from===beat.text);
 return edit?{...beat,text:edit.to}:beat;
}
export function refineStory(story){
 const result=structuredClone(story);
 for(const node of Object.values(result.nodes)){
  node.beats=node.beats.map(refineBeat);
  for(const choice of node.choices)choice.response=choice.response.map(refineBeat);
 }
 result.nodes.S20.time='高考结束当天，离校前收拾东西的下午';
 result.nodes.S20.choices.find(c=>c.id==='A').label='说还想和她一起吃一顿饭。';
 result.nodes.S09.time='录取条件确认后的第二天';
 return result;
}
export function upgradeEditorialSave(data){
 if(!data||typeof data!=='object')return data;
 const result=structuredClone(data);
 if(Array.isArray(result.queue))result.queue=result.queue.map(refineBeat);
 if(Array.isArray(result.checkpoints))result.checkpoints=result.checkpoints.map(point=>{
  if(!point||typeof point!=='object')return point;
  return {...point,queue:Array.isArray(point.queue)?point.queue.map(refineBeat):point.queue};
 });
 return result;
}
