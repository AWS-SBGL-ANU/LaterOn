import fs from 'node:fs';
const story=JSON.parse(fs.readFileSync('src/data/story.json','utf8'));
const environments={
 S01:'学校夜晚军训汇演，水泥看台，台阶扶手、远处舞台和串灯的粗铅笔轮廓，帽子、水杯、有线耳机。',S02:'午后教室靠窗的课桌，窗框、课本、笔记本和模糊黑板轮廓。',S15:'午后自习教室，两张相邻木课桌，蓝色圆珠笔、练习册、笔袋，地板桌腿。',S03:'高中教室同桌，数学试卷，橡皮，课本，窗外树枝的稀疏轮廓。',S04:'学校广播站门口，桌上试音稿、日程表、订书机，小五抱篮球。',S05:'傍晚校篮球场旁售货机和长椅，水瓶、硬币，远处篮筐的粗线条。',S16:'夕阳校门外冰淇淋小推车、小价目牌、摊主的简略侧影、草莓冰淇淋纸杯。',S17:'放学后人行道长椅，一棵树、路沿、小小的冰淇淋纸杯、同一把小勺子、纸巾。',S06:'雨夜校门口，檐下和公交站轮廓，一把蓝灰色伞，湿书包、路灯与水洼的粗线条。',S18:'冬日早读教室靠窗课桌，保温杯和小杯盖、手写作业纸、围巾和书。',S19:'白天城市公交车内部，两人相邻坐着，车窗、座椅靠背、扶杆、膝上书包，窗外树影。',S07:'高中午休教室，桌上考试安排和升学申请表，星期五旁画星星，女孩神色认真。',S20:'高考结束的旧教室，搬开的课桌和粉笔灰，旧笔记本，掌心的蓝色折纸星星。',S08:'高考结束傍晚的小面馆，简略菜单墙，方桌、两碗面、筷子、玻璃门，谈心。',S09:'录取结果公布后的小桥边，栏杆、河面和自行车，纸质录取表；带一点距离的两人。',S10:'机场出发大厅，行李箱、候机座椅、玻璃窗和远处登机口轮廓，书包拉链、早餐袋，真实告别。',S11:'远距离视频通话，左右分开的两个学生房间，男孩窗外白天、女孩窗外夜晚，电脑和手机，绝不能在同一房间。',S12:'女孩在学校广播间、男孩在国外学生桌前，通过手机消息联系，耳机、键盘、水杯、工作通知，不在同一房间。',S13:'大学广播楼外，门口台阶、校园树木和纸盒豆奶，久别重逢；女孩左男孩右。',S14:'毕业后的远距离视频讨论工作，两个分开的房间，工作邮件、日历、电脑边的小纸星星，严肃但克制。',B01:'夜晚公交站，路灯、站牌、折过的纸巾包装，面馆在远处，没说完的告白。',B02:'小桥边，近处自行车和桥栏、纸张和水瓶，两人正面商量未来，平静诚实。',B03:'小桥边傍晚，两人隔一点距离；女孩先退半步，尊重距离，除非某一格明确拥抱，不能提前亲密。',B04:'视频与手机联系，女孩在广播楼最后一级台阶上，耳机挂脖子，男孩在另一个房间；回放反馈。',B05:'女孩宿舍路边和男孩国外书桌，两个不同地点，回放链接、笔记、另约好的时间；不在同一房间。',B06:'深夜远程通话，女孩水杯冷在桌上，男孩另一个房间，屏幕和未回复消息，疲惫沉默。',B07:'周末工作室与女孩宿舍各在不同地点，闹钟、预约日历、工具和手机，选择守约或失约。',B08:'远程讨论同城生活，分开的房间，租房资料、预算纸、日历、小糖袋与外卖单，务实规划。',B09:'远程毕业谈话继续，两个分开的房间，各自翻开日历，认真讨论日期与条件，不在同一空间。',B10:'成年后的同一间小客厅，两人在同一张桌边，简历回复、热茶、工作邀请，窗框和台灯。',B11:'成年同城恋人，日常超市货架、盐袋和购物篮，后来家门前和雨伞下，小事慢慢做好。',F01:'大学暑假书店咖啡角，书架的粗轮廓，女孩抱书，两只杯子，朋友的友好距离，绝不画恋人拥抱。',D01:'远程认真告别，两个分开的房间，杯垫、杯子和旧笔记本；克制温和，无同室拥抱。',D02:'远程最后一次通话，两个分开的房间，各自手机和日历，沉默疲惫，不在同一房间。',D03:'成年同城日常，早餐摊和热气粗线条，纸巾，钥匙，后来小客厅桌上日历；女孩可戴圆眼镜。',E01:'成年同城生活，小厨房与餐桌，锅、干净勺子、购物袋、钥匙、旧笔记本，粗线条灶台窗框，温馨。',E02:'几年后的高中校庆，校园走廊和树、公告栏，女孩已婚戴戒指，各自有新生活，温柔坦然不画恋人拥抱。',E03:'夜晚书店外公交站和斑马线，女孩抱书，男孩手在口袋，路灯和车灯，两位朋友告别。',E04:'成年男孩独自地铁下班，车窗倒影、无线耳机、手机，后来车站台阶和面馆门口；女孩只有节目或消息，不在现场。'
};
const compositions=['环境交代的中远景，明确地点与人物相对位置','角色表情的中近景，保留一角环境和相关道具','手部与道具近景，手指结构清晰自然','从另一位角色肩后看向说话者的中景','能看清两人微妙反应的双人中景','物件与衣袖特写，背景只有必要轮廓','侧面中景，人物在环境中而不是白纸上漂浮','人物脸部近景，画出此刻克制的情绪','静静收束的环境与人物中远景'];
function group(beats){
 const result=[];
 for(const beat of beats){
  let last=result.at(-1);
  if(!last||last.length>=3||beat.kind==='action'||beat.when!==last[0].when||beat.art!==last.at(-1).art){last=[];result.push(last);}
  last.push(beat);
 }
 return result;
}
const shots=[];const nodes={};
for(const node of Object.values(story.nodes)){
 const map={dialogue:{},responses:{}};nodes[node.id]=map;
 const sequences=[['dialogue',node.beats],...node.choices.map(c=>[c.id,[...c.response,...node.tail]])];
 for(const [phase,beats] of sequences){
  const sequence=phase==='dialogue'?map.dialogue:(map.responses[phase]={});
  for(const [i,block] of group(beats).entries()){
   const ordinal=shots.length,sheet=`story-${String(Math.floor(ordinal/9)+1).padStart(2,'0')}`,index=ordinal%9;
   const id=`${node.id}-${phase}-${i}`;
   const choice=phase==='dialogue'?null:node.choices.find(c=>c.id===phase);
   const keyBeat=block[0];
   let composition=compositions[i%compositions.length];
   if(keyBeat.kind==='action')composition='用清楚的构图表现当前这一个动作，优先手部和道具接触的近景';
   let special='';
   if(node.id==='S15'&&keyBeat.art==='school-fingers')special='关键格！大特写：两只自然的手握同一根蓝笔，女孩食指指尖与男孩食指指尖在笔杆上方直接接触，接触点必须非常明确可见，不能隔着空隙，不要画两只分开的手。';
   if(node.id==='S01'&&phase==='A')special='本分支已经接过耳机。耳塞必须确实戴在两人可见的耳朵上，线自然连接，不可在脸颊或空中。';
   if(node.id==='S01'&&phase==='B')special='问歌名的分支：女孩只把另一只耳塞递出，男孩尚未戴上；不能提前画共同听歌。';
   if(node.id==='S15'&&keyBeat.art==='pen-reach')special='镜头贴近地面：两人蹲下向同一支地上的蓝笔伸手，桌腿可见，两手尚未抓住笔。';
   const shot={id,sheet,index,nodeId:node.id,phase,beats:block.map(b=>b.id),when:keyBeat.when??null,
    brief:`${node.title}。${node.time}。环境：${environments[node.id]}。${composition}。${choice?'此前选择：'+choice.label+'。':''}当前第一句（画面必须从这一刻就准确出现）：${keyBeat.speaker}：${keyBeat.text}。这一镜接着说：${block.slice(1).map(b=>b.speaker+'：'+b.text).join(' / ')}。${special}`};
   shots.push(shot);for(const beat of block)sequence[beat.id]=id;
  }
 }
}
const sheets=[];
for(let i=0;i<shots.length;i+=9)sheets.push({id:shots[i].sheet,shots:shots.slice(i,i+9)});
fs.mkdirSync('public/art/storyboards',{recursive:true});
fs.writeFileSync('src/data/storyboards.json',JSON.stringify({version:1,columns:3,rows:3,directory:'art/storyboards/',nodes,shots:Object.fromEntries(shots.map(({brief,when,...s})=>[s.id,s])),sheets:sheets.map(s=>s.id)},null,2));
fs.writeFileSync('Later_On_Architecture_Package/docs/ILLUSTRATED_STORYBOARD.json',JSON.stringify({shots,sheets:sheets.map(s=>s.id)},null,2));
fs.mkdirSync('.qa',{recursive:true});
fs.writeFileSync('.qa/storyboard-pages.json',JSON.stringify(sheets));
console.log(`Planned ${shots.length} distinct illustrations across ${sheets.length} sheets, all ${Object.keys(nodes).length} nodes and every choice response.`);
