// Small authored movements inside a single line. Labels describe the story,
// not the renderer. Pauses have their own duration and identical pose endpoints.
const profiles=new Map();
const step=(label,patch={},duration=650,extra={})=>({label,patch,duration,...extra});
function register(names,build){for(const name of names.split(' '))profiles.set(name,build);}
export const hasDetailedMovement=profile=>profiles.has(profile);

function helpers(cue){
 const a=cue.actor==='girl'?'girl':'boy',b=a==='girl'?'boy':'girl';
 const sign=a==='girl'?1:-1;
 return {a,b,sign,at:(x,y,angle=0)=>({prop:{x,y,angle}}),
  joint:(who,inner,head=0,wrist=0)=>({[who]:{inner,head,wrist}}),
  handX:a==='girl'?660:1000};
}

register('offer receive receive-water pass-earbud pass-water pass-drink offer-tissue offer-snack pass-chopsticks pass-spoon',(c)=>{
 const receiving=['receive','receive-water'].includes(c.profile);
 const {a,b,sign,joint,handX}=helpers(receiving?{...c,actor:c.actor==='girl'?'boy':'girl'}:c);
 const name={earbuds:'耳机',water:'水瓶',drink:'豆奶',tissue:'纸巾',food:'点心',chopsticks:'筷子',spoon:'勺子'}[c.object]??'东西';
 return [step('先拿稳', {...joint(a,sign*24,5),prop:{x:handX,y:620}},650,{object:c.object==='water'?'bottle':c.object,extras:c.object==='water'?[{kind:'bottle',x:a==='girl'?560:1100,y:650}]:[]}),
  step(`把${name}递近`,{...joint(a,-sign*18,5,-sign*9),prop:{x:795,y:575}},850),
  step('等对方伸手',{},480),step('轻轻接住',joint(b,sign*19,-4,sign*7),850),
  step('确认拿稳，再松开',{...joint(a,sign*12,0,0),prop:{x:b==='girl'?610:1010,y:610}},650)];
});
register('slide-notebook turn-notebook slide-bowl slide-cup slide-coaster',(c)=>{
 const {a,b,sign,joint,handX}=helpers(c);const object=c.object==='notebook'?'本子':c.object==='coaster'?'杯垫':c.object==='food'?'面碗':'杯子';
 return [step(`扶住${object}`,{...joint(a,-sign*5,10),prop:{x:handX,y:650,angle:0}}),
  step(c.profile==='turn-notebook'?'慢慢转向对方':'沿桌面推过去',{...joint(a,-sign*22,8,7),prop:{x:800,y:650,angle:c.profile==='turn-notebook'?18:0}},1000),
  step('手指还压着一角',{},520),step('对方接稳后才收手',{...joint(b,sign*16,8),[a]:{inner:0,wrist:0}},750)];
});
register('smooth-page straighten-pages quiet-page mark-page mark-calendar mark-itinerary cross-out listen-and-note uncap-and-write',(c)=>{
 const {a,sign,joint}=helpers(c);
 const writing=['mark-page','mark-calendar','mark-itinerary','cross-out','listen-and-note','uncap-and-write'].includes(c.profile);
 return [step(c.profile==='uncap-and-write'?'取下笔帽':writing?'把纸扶稳':'指尖扶住书页',{...joint(a,sign*5,12),prop:{x:800,y:648,angle:0}},650,{extras:writing?[{kind:'pen',x:a==='girl'?760:850,y:622,scale:.45,angle:-25}]:[]}),
  step(writing?'笔尖轻轻落下':'先掀起一个页角',joint(a,-sign*9,12,sign*12),700),
  step(writing?'一笔一笔写完':'慢慢翻过，再把折角抚平',joint(a,sign*12,11,-sign*10),1000),
  step(writing?'停笔，看一眼对方':'放轻手，等纸页落稳',joint(a,0,4,0),650)];
});
register('take-eraser place-eraser place-object place-star hold-star place-star pack-star',(c)=>{
 const {a,b,sign,joint,handX}=helpers(c);
 return [step(c.profile==='pack-star'?'摊开书包口':'先把手掌摊开',{...joint(a,-sign*5,8),prop:{x:800,y:630}}),
  step(c.profile==='take-eraser'?'拿过橡皮':'轻轻托住',joint(a,-sign*20,9,sign*10),800),
  step('在掌心停一会儿',{},650),
  step(c.profile==='pack-star'?'小心收进内袋':'慢慢放到身边',{...joint(a,sign*8,8,0),prop:{x:handX,y:c.profile==='pack-star'?690:650}},850),
  step('抬眼，看了看对方',joint(b,0,-5),450)];
});
register('star-falls',(c)=>[step('旧本子放到桌上',{girl:{inner:-16,head:9},prop:{x:795,y:590,angle:0}},700),
 step('夹页轻轻散开',{prop:{x:805,y:630,angle:23}},550),step('纸星星从书页滑出',{prop:{x:815,y:697,angle:80}},800),
 step('他把手掌摊在下面',{boy:{inner:25,head:12,wrist:-8}},600),step('轻轻接住，暂时不收起',{prop:{x:805,y:604,angle:10},boy:{inner:17}},850)]);
register('align-chopsticks',()=>[step('先把两根筷子拿齐',{girl:{inner:-8,head:10},prop:{x:620,y:610,angle:8}},650),
 step('筷尖轻轻碰一下桌面',{girl:{wrist:7},prop:{y:650,angle:0}},600),step('又碰齐了一次',{girl:{wrist:-5},prop:{y:638}},550),
 step('放平后，才慢慢抬起头',{girl:{wrist:0,head:2},prop:{y:645}},800)]);
register('walk-together',()=>[step('两个人先把东西收好',{girl:{inner:0},boy:{inner:0},prop:{opacity:0}},650),
 step('先迈一步，等对方跟上',{boy:{x:990},girl:{head:5}},900),step('她把步子放得和他一样慢',{girl:{x:420},boy:{x:1005}},1000),
 step('并肩再走一小段',{girl:{x:500},boy:{x:1085},prop:{opacity:0}},1100)]);
register('search-bag search-pocket check-gift check-seat check-plan compare-shopping',(c)=>{
 const {a,sign,joint}=helpers(c);
 return [step('低头，先找一找',{...joint(a,sign*12,15),prop:{x:800,y:660}}),
  step(c.profile==='compare-shopping'?'把两份拿近比较':'翻开，再看一遍',joint(a,-sign*8,12,sign*12),850),
  step('指尖停了一下',{},450),step('抬头确认',joint(a,sign*6,-4,0),650)];
});
register('hesitate-cup lower-cup take-own-cup sip-and-pause nervous-drink',(c)=>{
 const {a,sign,joint,handX}=helpers(c);
 return [step('把杯子扶稳',{...joint(a,-sign*9,8),prop:{x:handX,y:625}}),
  step(c.profile==='sip-and-pause'?'慢慢送到唇边':'拿起一点，又停住',{...joint(a,-sign*27,7,sign*8),prop:{x:handX,y:c.profile==='sip-and-pause'?450:560}},850),
  step('话先停在这里',{},600),step('轻轻放下',{...joint(a,sign*4,10,0),prop:{x:handX,y:650}},900)];
});
register('steady-cup scoop taste lower-spoon',(c)=>{
 const labels=c.profile==='taste'?['把小勺拿稳','慢慢送到唇边','只尝一小口','放下勺子，避开视线']
  :c.profile==='lower-spoon'?['把勺子从唇边移开','慢慢放回杯沿','抬眼看了他一下','他把目光挪开']
  :['一只手先扶稳杯子','勺子沿着边缘挖一点','抬起一小口，等它不再滴落','再轻轻收回'];
 const x=605,spoon=c.profile!=='steady-cup';
 return [step(labels[0],{girl:{inner:-12,head:7,wrist:0},prop:{x,y:630}},650,{object:spoon?'spoon':c.object,extras:spoon?[{kind:'icecream-cup',x:600,y:655,scale:.85}]:[]}),
  step(labels[1],{girl:{inner:-28,head:9,wrist:14},prop:{x:650,y:c.profile==='taste'?438:555,angle:25}},950,{loaded:spoon}),
  step(labels[2],{},650,{eyes:c.profile==='taste'?'girl':'',loaded:c.profile==='taste'?false:spoon}),
  step(labels[3],{girl:{inner:-8,head:-8,wrist:0},boy:{head:9},prop:{x:605,y:620,angle:0}},850,{loaded:false})];
});
register('buy-icecream share-tissue',(c)=>{
 const {a,b,sign,joint}=helpers(c);
 return [step(c.profile==='share-tissue'?'把纸巾的一半递过去':'双手接住纸杯',{...joint(a,-sign*9,8),prop:{x:800,y:615}}),
  step('留出对方能拿住的位置',joint(a,-sign*20,6,sign*8),750),
  step('对方伸手，轻轻扶住',joint(b,sign*19,7),800),
  step(c.profile==='share-tissue'?'没有马上全放开':'拿稳了，才抬头看她',joint(a,sign*2,-4,0),650)];
});
register('lift-umbrella share-umbrella wait-under-umbrella move-bag-close shelter-bag',(c)=>{
 const umbrella=c.object==='umbrella';
 return [step(umbrella?'把伞柄握稳':'先把书包举起来',{girl:{inner:-12,head:4},prop:{x:760,y:600,angle:0}},650),
  step(umbrella?'向他那边挪一点':'听见她叫他，慢慢停住',{girl:{inner:-23,wrist:-7},boy:{head:-8},prop:{x:820,y:570,angle:-5}},850),
  step('等他站稳',{},600),step(c.profile==='share-umbrella'?'他又轻轻推回她那边':'靠近半步，留出位置',{girl:{x:495,head:5},boy:{x:860,inner:14,wrist:6},prop:{x:790,y:575,angle:4}},1000),
  step('最后停在两个人中间',{prop:{x:800,y:575,angle:0},girl:{wrist:0},boy:{wrist:0}},600)];
});
register('unpack-thermos pour warm-cup warm',(c)=>{
 if(c.profile==='warm-cup'||c.profile==='warm')return [step('双手捧住小杯',{girl:{inner:-16,outer:12,head:10},prop:{x:610,y:590}},650),
  step('轻轻吹一口气',{girl:{head:13,wrist:5},prop:{x:610,y:495}},900,{eyes:'girl'}),step('等热气散开',{},800),step('慢慢喝一点',{girl:{inner:-27,head:8},prop:{x:610,y:460}},800),step('再放低一点',{prop:{x:610,y:540}},650)];
 return [step('拿出保温杯，扶稳杯盖',{boy:{inner:-8,head:13},prop:{x:1020,y:620,angle:0}},700),
  step('先把杯盖拧开',{boy:{inner:10,wrist:15}},650,{open:true,extras:[{kind:'drink',x:790,y:655,scale:.65},{kind:'cap',x:1055,y:660,scale:.8}]}),
  step('杯口对准，缓缓倾斜',{boy:{inner:34,wrist:12},prop:{x:825,y:545,angle:-40}},900,{pour:true}),
  step('少倒一点，停一下',{},850),step('扶正杯身，轻轻放回',{boy:{inner:4,wrist:0},prop:{x:1000,y:635,angle:0}},800,{pour:false})];
});
register('settle-bag drowsy-sway offer-shoulder approach-shoulder lean stir-awake wake',(c)=>{
 if(['drowsy-sway','settle-bag'].includes(c.profile))return [step('把背包放到膝上',{prop:{x:600,y:705},girl:{head:3}},650),
  step('车身一晃，头也轻轻偏过去',{girl:{head:12,tilt:5}},900),step('她自己又坐直',{girl:{head:0,tilt:0}},850),step('把手重新放稳',{girl:{inner:0}},500)];
 if(c.profile==='offer-shoulder')return [step('想说什么，先看了她一眼',{boy:{head:-5}},600),step('指到肩膀旁，停在半空',{boy:{inner:35,wrist:-12}},850),
  step('等她自己决定',{},700),step('又有点不好意思地放下',{boy:{inner:0,wrist:0,head:4}},750)];
 if(['stir-awake','wake'].includes(c.profile))return [step('先轻轻叫她，不急着起身',{boy:{head:-7},girl:{head:13,tilt:10,x:590}},650),
  step('她动了动，慢慢抬头',{girl:{head:5,tilt:4}},1000),step('等她坐稳',{girl:{x:480,tilt:0,head:0}},950),step('再把背包扶好',{prop:{x:610,y:690}},650)];
 return [step('她先看了一眼窗外',{girl:{head:-6},boy:{head:-2}},650),step('慢慢挪近，不立刻靠下',{girl:{x:550,head:4},boy:{x:850}},950),
  step('发梢轻轻碰到衣领',{girl:{x:590,y:182,head:12,tilt:12},boy:{x:830}},1000),
  step('他把拿手机的手放回膝上',{boy:{inner:0,wrist:0},prop:{x:650,y:710}},850,{eyes:'girl'}),step('两个人都安静下来',{},800)];
});
register('open-arms half-step approach hug embrace release hold-hands pinky pinky-and-zip touch-and-receive',(c)=>{
 if(c.profile==='hold-hands'||c.profile==='pinky'||c.profile==='pinky-and-zip'||c.profile==='touch-and-receive'){
  const stages=[
  step(c.profile.startsWith('pinky')?'先伸出小指':'手掌摊开，留在两人之间',{boy:{inner:14,wrist:-7},prop:{opacity:0}},750),
  step('等她自己伸过来',{},800),step('她低头看了看，慢慢伸手',{girl:{x:450,inner:-18,head:9,wrist:8},boy:{x:820,inner:18}},1000),
  step(c.profile.startsWith('pinky')?'小指轻轻勾住':'指尖先轻轻碰到',{girl:{wrist:4},boy:{wrist:-4}},650),
  step('确认没有移开，才轻轻握住',{girl:{inner:-22,head:5},boy:{inner:22,head:-5}},850)];
  if(c.profile==='pinky-and-zip')stages.push(step('另一只手拉好书包拉链',{boy:{outer:-22}},750,{extras:[{kind:'bag',x:1110,y:640,scale:.7}]}),step('小指还勾着，手才慢慢放下',{boy:{outer:0}},650));
  return stages;
 }
 if(c.profile==='open-arms')return [step('先把手从身侧抬起',{boy:{inner:4,outer:-15}},700),step('慢慢张开双臂',{boy:{inner:38,outer:-65,wrist:-9}},1000),
  step('站在原地，等她回应',{},1100)];
 if(c.profile==='half-step'||c.profile==='approach')return [step('先抬眼看看他',{girl:{head:5}},650),step('往前迈半步',{girl:{x:510}},850),step('再靠近一点',{girl:{x:570,y:165},boy:{x:865}},950),
  step('额头轻轻碰上衣料',{girl:{head:10,y:182},boy:{inner:30,outer:-50}},800)];
 if(c.profile==='release')return [step('她先把抱着的手松一点',{girl:{inner:-30,wrist:0}},800),step('他也把手慢慢放下',{boy:{inner:17,outer:-10,wrist:0}},1000),
  step('退开半步，仍看着对方',{girl:{x:460,y:155,head:5,tilt:0},boy:{x:860,y:155,head:-5,tilt:0}},1050),
  step('最后轻轻碰了碰指尖',{girl:{inner:-12},boy:{inner:12}},650),step('再各自把手收回',{girl:{inner:0},boy:{inner:0}},700)];
 if(c.profile==='embrace')return [step('暂时不说话，手仍停在那里',{},850,{eyes:'both'}),step('把呼吸慢下来',{girl:{y:199},boy:{y:162}},900),step('听见广播，也没有马上松手',{girl:{y:197},boy:{y:160}},950)];
 return [step('靠近后，手还留在肩膀外侧',{girl:{x:570,y:175,head:9},boy:{x:850,inner:25,outer:-45}},850),
  step('先轻轻合拢一侧手臂',{boy:{inner:43,outer:-35},girl:{x:560,head:12}},950),
  step('等她放松，才抱稳一点',{boy:{x:785,inner:54,head:-15,tilt:-3},girl:{y:197,inner:c.setting==='bridge'?-15:-48,head:14,tilt:9}},1150,{eyes:c.setting==='bridge'?'boy':'both'}),
  step(c.setting==='bridge'?'她只抓住袖口，没有立刻回抱':'她轻轻抓住背后的衣料',{girl:{wrist:9,outer:18}},850),step('停留一会儿，谁也没有催',{},1000)];
});
register('zip-bag put-breakfast wipe-and-selfie lower-camera',(c)=>{
 if(c.profile==='put-breakfast')return [step('先把早餐袋提稳',{boy:{inner:12,head:10},prop:{x:960,y:600}},650),step('放到行李箱上',{prop:{x:1370,y:565},boy:{outer:-25}},1000),step('确认不会滑下来',{},600),step('放开提绳，转回身',{boy:{outer:0,head:-4},prop:{opacity:0}},800)];
 if(c.profile==='zip-bag')return [step('先扶住书包外袋',{girl:{inner:-14,head:12},prop:{x:995,y:610}},650),step('两指捏住拉链头',{girl:{wrist:13,inner:-23}},700),step('慢慢拉到尽头',{girl:{inner:-12,wrist:-12}},1000),step('手在拉链上停一会儿',{},650),step('再轻轻收回',{girl:{inner:0,wrist:0}},700)];
 if(c.profile==='lower-camera')return [step('照片拍完，手先不放下',{},600),step('慢慢放低手机',{prop:{x:1090,y:610,angle:0},boy:{outer:0}},900),step('又并肩站了一会儿',{},950)];
 return [step('她先擦了擦眼角',{girl:{outer:44,head:6}},850),step('把手放下，整理好表情',{girl:{outer:0,head:0}},700),step('两个人再靠近镜头',{girl:{x:570},boy:{x:865,outer:-65},prop:{x:1235,y:470,angle:-12}},1000),step('笑得有点勉强，也认真留下这一张',{},900)];
});

// Smaller everyday actions still have preparation, a visible movement, a pause
// and a release. The target differs by gesture rather than sharing one nod.
const gestures={
 'make-room':['把身边的东西收拢','向旁边让出半个位置','留着位置，等他坐下','sit'],
 'adjust-earbud':['拿稳另一只耳机','绕开袖口，把线放松一点','各自坐好，留住那一点距离','ear'],
 'look-back':['先往前走一步','停住，回头看一眼','再慢慢转回去','turn'],
 'glance-and-smile':['先看了看门口','转回来时，已经忍不住笑','把笑藏进低下去的视线里','turn'],
 'look-away':['先抬眼看一看','目光转回黑板','嘴角还没完全收住','turn'],
 'hold-ball':['把球抱得稳一点','想开口，手却攥紧球边','再抬头看她','hold'],
 'read-and-glance':['先把稿子拿稳','念第一句时看了他一眼','又低下头，接着念','read'],
 'fold-and-sit':['把试音稿沿原来的折痕折好','挪近一点，慢慢坐下','手里的纸没有马上收起','sit'],
 'sit-with-space':['先扶住长椅边缘','轻轻坐下，留一点空隙','把纸杯放稳','sit'],
 'stop-and-look':['脚步先慢下来','转头看向小推车','再看一眼身旁的人','turn'],
 'ask-to-taste':['目光先落在纸杯上','转过头，小声开口','等他回答，没有先拿勺子','turn'],
 'touch-nape':['想解释，手先抬了一点','摸了摸后颈','手放下来，话还没说完','nape'],
 'shy-glance':['看了看杯子','余光又去看她','装作还在认真看杯子','turn'],
 'answer-smile':['先听他讲完','抬眼看着他的表情','这才轻轻笑起来','smile'],
 'move-chair':['把椅子边缘扶住','一点一点挪近桌边','坐稳后，才重新看向对方','sit'],
 'move-chair-aside':['先看她要走的方向','把挡路的椅子轻轻拉开','收回手，等她自己起身','chair'],
 'reach-and-yield':['两个人同时伸手','看见彼此的手，又都停住','各自让开一点，谁也没先拿','yield'],
 'reach-and-stop':['手先下意识伸出去','在半路停住','慢慢收回，仍留着原来的距离','yield'],
 'respect-distance':['他想靠近一点','她先退了半步','他停住脚，没有继续往前','distance'],
 'hands-still':['把资料摊开','手停在上面，没有继续翻页','留一点安静，让对方把话说完','still'],
 'close-plans':['把摊开的资料扶住','慢慢合上','手指还停在封面边缘','close'],
 'cap-and-turn':['把杯子放稳','慢慢盖紧杯盖','目光转向车来的方向','close'],
 'turn-phone-down':['指尖停在手机边缘','把屏幕轻轻扣向桌面','再慢慢收回手','phone-down'],
 'fold-tissue':['把包装边角折好','又一点点展开','指尖停住，等那句话','fold'],
 'brush-hair':['抬手到耳边','轻轻拨开一缕头发','把手放回身侧','hair'],
 'erase-desk':['把橡皮压在旧笔迹上','沿着桌角慢慢擦掉','拂开碎屑，再看一眼','erase'],
 'hold-books':['把书往怀里抱稳','看见他时，先抬了头','放松一点，轻轻笑起来','hold'],
 'steady-bicycle':['先扶住车把','把车身扶正，确认支架稳了','再把手从车把上放开','hold'],
 'make-space-keys':['把自己的钥匙收拢','往旁边挪一点，留出一半位置','再把另一串轻轻放好','place'],
 'pass-in-kitchen':['转身时先放慢一点','手碰了一下，又给对方让开','把锅边的东西扶稳','yield'],
 'steady-bowl':['先接住碗沿','用另一只手扶稳','确认不烫手，才慢慢收回','hold'],
 'share-spoon':['两个人同时伸向勺子','指尖轻轻碰上','一起停一下，再慢慢接好','yield'],
 'share-bag':['他先接过重的一边','她又往自己这边拉了一点','两个人把重量分稳','hold'],
 'cook':['先把火关小一点','沿锅边慢慢搅一圈','停勺，听她说完','stir'],
 'clear-and-leave':['先把碗收好','拿起钥匙，等对方站稳','一起走向门口','leave'],
 'leave-separately':['先退开一点距离','各自看向自己要去的方向','再分别迈开脚步','leave'],
 'farewell-pack':['她先走下一级台阶','他低头把水杯放进包里','过了一会儿，才起身离开','leave'],
 'board-and-wave':['她先扶稳书包上车','他等她找到座位','这才举起手，慢慢挥一下','wave'],
 'last-wave':['手从身侧抬起','轻轻挥一下，不急着收回','等她看见，再慢慢放下','wave'],
 'pocket-and-walk':['先把手机和手收回口袋','抬头确认前面的路','再迈步，慢慢往前走','leave'],
 'enter-diner':['先放慢脚步','抬手把门推开一点','留出位置，再走进去','door'],
 'climb-steps':['先踏上第一级台阶','抬脚，再向上迈一步','站稳后才继续向前','steps'],
 'sit-and-order':['先扶住拉开的椅子','慢慢坐稳，把书包放好','抬起头，说出今晚想吃的','sit'],
 'pack-gift':['把小袋糖拿稳','放进书包内侧','把袋口理平，不让它挤坏','pack'],
 'wrap-notebook':['先在纸箱边角垫好软纸','把旧笔记轻轻放进去','再把四角一一扶稳','pack'],
 'pack-chopsticks':['把筷子收在一起','慢慢放进纸袋','把袋口折好，手才松开','pack'],
 'put-chopsticks':['先把筷子拿齐','轻轻放回桌上','不再往前递，慢慢收手','place']
};
for(const [name,[a,b,c,gesture]] of Object.entries(gestures))register(name,cue=>{
 const {a:actor,b:other,sign,joint,handX}=helpers(cue);
 const prepare={...joint(actor,sign*7,7),prop:{x:handX,y:635,angle:0}};
 const act={...joint(actor,-sign*18,10,sign*9)};
 const finish={...joint(actor,0,2,0)};
 if(['turn','smile'].includes(gesture)){act[actor]={head:sign*12};finish[actor]={head:-sign*4};}
 if(['nape','hair','ear'].includes(gesture)){act[actor]={outer:sign*60,head:sign*8};finish[actor]={outer:0,head:3};}
 if(gesture==='yield'){act[actor]={inner:-sign*24,wrist:sign*8};act[other]={inner:sign*24,wrist:-sign*8};finish[other]={inner:0,wrist:0};}
 if(gesture==='distance'){act.girl={x:280,head:-4};act.boy={x:920,inner:0};}
 if(gesture==='sit'){act[actor]={x:actor==='girl'?470:860,y:168};finish[actor]={y:175,head:3};}
 if(gesture==='chair'){act.prop={x:1160,y:690,angle:5};finish.prop={x:1170,y:700,angle:0};}
 if(gesture==='phone-down'){act.prop={x:handX,y:650,angle:90};finish.prop={x:handX,y:650,angle:180};}
 if(gesture==='stir'){act[actor]={inner:-sign*25,wrist:sign*15};finish[actor]={inner:-sign*9,wrist:-sign*10};}
 if(gesture==='wave'){act[actor]={outer:sign*65,head:-sign*3};finish[actor]={outer:0};}
 if(gesture==='leave'){act[actor]={x:actor==='girl'?300:1070};finish[actor]={x:actor==='girl'?120:1240,head:0};}
 if(gesture==='steps'){act[actor]={x:1020,y:135};finish[actor]={x:1120,y:115};}
 if(gesture==='door'){act[actor]={inner:-sign*35,x:1000};finish[actor]={inner:0,x:1150};}
 if(['pack','place','close'].includes(gesture)){act.prop={x:handX,y:680,angle:gesture==='close'?12:0};finish.prop={x:handX,y:680,opacity:gesture==='pack'?0:1};}
 return [step(a,prepare,650),step(b,act,1050),step('稍稍停一会儿',{},500),step(c,finish,900)];
});

register('wipe-and-call prepare-listening put-earbuds dismiss-message sit-and-read open-close-send mute-and-close answer-call check-message stop-playback hesitate-hangup open-window',(cue)=>{
 const {a,sign,joint,handX}=helpers(cue);
 const labels={
  'wipe-and-call':['把桌面慢慢擦干净','拿起手机，拨通视频','看见她接通，才放松一点'],
  'prepare-listening':['耳机放到键盘旁','把水和链接准备好','消息亮起，手停了一下'],
  'put-earbuds':['拿稳耳机线','轻轻戴好，不让线缠住','调低一点音量，再认真听'],
  'dismiss-message':['看着还没回复的消息','指尖停一下，关掉页面','屏幕暗下去，手却没有马上放开'],
  'sit-and-read':['走到台阶边，先坐稳','拿起亮着的手机','看完那句话，才抬起头'],
  'open-close-send':['先点开回放链接','又关上，犹豫了一会儿','最后重新打开，发了过去'],
  'mute-and-close':['看一眼已写好的约定','把工作群调成静音','收好手机，按时走出去'],
  'answer-call':['等约好的时间到了','伸手接起电话','看见她，才抬起头'],
  'check-message':['手机亮起，先看一眼','用指尖慢慢划开','看完后停了一下'],
  'stop-playback':['把片尾听完','指尖落在退出的位置','轻轻收起手机'],
  'hesitate-hangup':['手指移到挂断键旁','停住，等最后一句说完','这才轻轻按下'],
  'open-window':['先站到窗边','伸手，把窗轻轻推开一点','收回手，让风慢慢进来']
 }[cue.profile];
 return [step(labels[0],{...joint(a,sign*7,9),prop:{x:handX,y:615}},650),
  step(labels[1],joint(a,-sign*18,11,sign*10),900),step('没有急着做下一个动作',{},700),
  step(labels[2],{...joint(a,sign*4,3,0),prop:{x:handX,y:650,angle:cue.profile==='hesitate-hangup'?18:0,opacity:['dismiss-message','stop-playback'].includes(cue.profile)?0:1}},850)];
});

export function detailedTimeline(cue,initial){
 const profile=cue.profile??cue.action,build=profiles.get(profile);
 if(!build)return null;
 const stages=build({...cue,profile});
 const frames=[structuredClone(initial)],times=[0],moments=[];
 let elapsed=0,object=cue.object,extras=[],eyes='',open=false,pour=false,loaded=false;
 for(const stage of stages){
  object=stage.object??object;extras=stage.extras??extras;eyes=stage.eyes??eyes;
  open=stage.open??open;pour=stage.pour??pour;loaded=stage.loaded??loaded;
  const pose=structuredClone(frames.at(-1));
  for(const [part,patch] of Object.entries(stage.patch))Object.assign(pose[part],patch);
  const moving=['girl','boy'].filter(who=>Math.abs(pose[who].x-frames.at(-1)[who].x)>25);
  moments.push({at:elapsed,until:elapsed+stage.duration,label:stage.label,object,extras,eyes,moving,open,pour,loaded});
  elapsed+=stage.duration;frames.push(pose);times.push(elapsed);
 }
 return {duration:elapsed,frames,stops:times.map(t=>t/elapsed),moments:moments.map(m=>({...m,at:m.at/elapsed,until:m.until/elapsed})),profile};
}

export function momentAt(timeline,progress){
 return timeline.moments?.findLast(m=>m.at<=Math.max(0,progress))??null;
}
