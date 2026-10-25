// Match concrete stage directions, not isolated verbs in memories or thoughts.
// [text fragment, movement profile, object, actor, optional staging]
export const sceneDirections={
 S01:[['水杯拿起来，又放下','hesitate-cup','water','boy'],['用帽子给他让出','make-room','earbuds','girl'],['耳机又往前递','pass-earbud','earbuds','girl'],['耳机线搭在','adjust-earbud','earbuds','boy'],['下台阶时回头','look-back','chair','boy']],
 S02:[['备用笔放在桌角','place-object','pen','girl'],['本子推过来','slide-notebook','notebook','girl'],['先看门口','glance-and-smile','notebook','girl'],['把橡皮拿走了','take-eraser','eraser','girl'],['折角抚平','smooth-page','notebook','girl']],
 S15:[['翻了两遍笔袋','search-bag','bag','boy'],['两个人终于坐好','uncap-and-write','notebook','boy'],['视线移回黑板','look-away','pen','girl'],['旧橡皮和自己的','place-eraser','eraser','girl']],
 S03:[['把名字看了两遍','check-seat','notebook','boy'],['数学卷子推过来','slide-notebook','notebook','girl'],['椅子挪近','move-chair','notebook','girl'],['同时去拿橡皮','reach-and-yield','eraser','boy'],['先在边角画','mark-page','notebook','girl']],
 S04:[['篮球却一直抱','hold-ball','ball','boy'],['低头理稿子','straighten-pages','notebook','girl'],['日程表的两点','mark-calendar','calendar','girl'],['念第一句时看','read-and-glance','notebook','girl'],['走到门外才','look-back','ball','boy']],
 S05:[['售货机前翻硬币','search-pocket','coins','boy'],['试音稿折小','fold-and-sit','notebook','girl'],['瓶身上起了一层','pass-water','water','boy'],['才跟着笑起来','answer-smile','water','girl']],
 S16:[['小推车前慢了一步','stop-and-look','icecream','girl'],['他接过那杯草莓','buy-icecream','icecream','boy'],['纸巾接过去，留了一半','share-tissue','tissue','girl']],
 S17:[['中间还留了一点空隙','sit-with-space','icecream','girl'],['免得冰淇淋滴到','steady-cup','icecream','girl'],['她看着杯子里的','ask-to-taste','icecream','girl'],['她放下勺子','lower-spoon','icecream','girl'],['摸了摸后颈','touch-nape','icecream','boy'],['很认真地看着杯子','shy-glance','icecream','boy']],
 S06:[['书包顶到头上','shelter-bag','bag','boy'],['抬了抬伞柄','lift-umbrella','umbrella','girl'],['书包挪到另一侧','move-bag-close','umbrella','girl'],['他又推回来','share-umbrella','umbrella','girl'],['等他站稳','wait-under-umbrella','umbrella','girl']],
 S18:[['拿出保温杯','unpack-thermos','thermos','boy'],['她捧住杯盖','warm-cup','drink','girl'],['放轻了翻页声','quiet-page','notebook','boy'],['挡路的椅子','move-chair-aside','chair','boy'],['页边写了一个','mark-page','notebook','girl']],
 S19:[['背包放在膝上','settle-bag','bag','girl'],['又自己坐直了','drowsy-sway','bag','girl'],['指了指自己的肩膀','offer-shoulder','bag','boy'],['才轻轻靠过来','approach-shoulder','bag','girl'],['她的发梢碰到他衣领','lean','bag','girl'],['她动了动','stir-awake','bag','girl'],['她下车时看了他','look-back','bag','girl']],
 S07:[['申请册转正','turn-notebook','application','girl'],['她勾住他的小指','pinky','application','girl'],['她伸出小指','pinky-and-zip','application','girl'],['把已经写对的答案','cross-out','notebook','girl']],
 S20:[['擦掉自己桌角','erase-desk','eraser','boy'],['夹页里掉出一颗','star-falls','star','girl'],['星星托在掌心','hold-star','star','boy'],['等他把书包拉好','pack-star','star','boy']],
 S08:[['筷尖在桌上碰齐','align-chopsticks','chopsticks','girl'],['把面推过来','slide-bowl','food','girl'],['拆好的筷子递给他','pass-chopsticks','chopsticks','girl'],['小路，慢慢走了一段','walk-together','none','boy'],['手掌摊在两个人之间','hold-hands','none','boy'],['她说完低头喝水','sip-and-pause','drink','girl'],['另一双筷子放在桌上','put-chopsticks','chopsticks','girl'],['筷子收进纸袋','pack-chopsticks','chopsticks','girl']],
 S09:[['没有立刻拧开','receive-water','water','girl']],
 S10:[['书包外袋的拉链','zip-bag','bag','girl'],['早餐袋放到行李箱上','put-breakfast','breakfast','boy'],['轻轻张开手','open-arms','none','boy'],['往前挪了半步','half-step','none','girl'],['额头轻轻靠上来','approach','none','girl'],['他才慢慢抱住她','hug','none','boy'],['她先松开一点','release','none','girl'],['把回程日期划','mark-itinerary','application','girl'],['她擦过眼角才','wipe-and-selfie','phone','girl'],['照片拍完','lower-camera','phone','boy']],
 S11:[['台面擦了两遍','wipe-and-call','phone','boy','remote']],
 S12:[['耳机放到键盘旁','prepare-listening','earbuds','boy','remote'],['先把耳机戴好','put-earbuds','earbuds','boy','remote'],['小五关掉消息页','dismiss-message','phone','boy','remote']],
 S13:[['豆奶快被捏扁','nervous-drink','drink','girl'],['伸出去的手在半路','reach-and-stop','bag','boy'],['那盒豆奶递过来','pass-drink','drink','girl'],['把她接进怀里','hug','none','boy']],
 S14:[['纸星星放在电脑旁','place-star','star','girl','remote'],['两个人都有空的那一天','mark-calendar','calendar','girl','remote'],['没有翻动的资料','hands-still','application','boy','remote'],['纸星星握在手里','hold-star','star','girl','remote']],
 B01:[['边角折好又展开','fold-tissue','tissue','girl'],['手从口袋里拿出来','hold-hands','none','girl'],['饮料盖紧','cap-and-turn','drink','girl']],
 B02:[['自行车扶正','steady-bicycle','bicycle','girl']],
 B03:[['她却先退了半步','respect-distance','none','girl'],['她点了点头，他才','hug','none','boy']],
 B04:[['坐在了最后一级台阶','sit-and-read','phone','girl','remote']],
 B05:[['回放链接点开又关上','open-close-send','phone','girl','remote'],['边听边记下','listen-and-note','notebook','boy','remote']],
 B06:[['手机扣回桌上','turn-phone-down','phone','boy','remote']],
 B07:[['先看了一眼已经写下','check-plan','calendar','boy','remote'],['工作群调成静音','mute-and-close','phone','boy','remote'],['电话按约定接通','answer-call','phone','boy','remote']],
 B08:[['往包里放了一小袋糖','pack-gift','candy','girl'],['袋口夹着','check-gift','candy','boy'],['租房页合上','close-plans','application','girl','remote']],
 B09:[['日历，却都没有立刻','hands-still','calendar','boy','remote'],['日期写下时','mark-calendar','calendar','girl','remote']],
 B10:[['茶推到他手边','slide-cup','drink','girl'],['椅子往桌边挪','move-chair','application','girl']],
 B11:[['盐该买哪一袋','compare-shopping','groceries','girl'],['把伞往中间挪','share-umbrella','umbrella','girl'],['看见他手里提着','offer-snack','food','boy'],['两个人拿着就好','share-bag','groceries','boy']],
 F01:[['抱着刚买的书','hold-books','notebook','girl'],['小五把杯子放下','lower-cup','drink','boy'],['最上面那本书转','turn-notebook','notebook','girl']],
 D01:[['杯垫往他那边推','slide-coaster','coaster','girl'],['杯子也各自带走','take-own-cup','drink','boy'],['纸箱边角垫','wrap-notebook','notebook','boy','solo']],
 D02:[['手指停在挂断键','hesitate-hangup','phone','boy','remote'],['窗户推开了一点','open-window','none','girl','remote']],
 D03:[['又把纸巾递了过去','offer-tissue','tissue','boy'],['指尖在他手边轻轻碰','touch-and-receive','tissue','girl'],['煮了第一锅汤','cook','food','boy'],['常放的地方让出一半','make-space-keys','keys','girl']],
 E01:[['转身时还是偶尔会碰到','pass-in-kitchen','food','boy'],['干净的勺子递过去','pass-spoon','spoon','girl'],['两人收好碗','clear-and-leave','keys','boy'],['伸手接同一只汤勺','share-spoon','spoon','boy'],['把她那只碗扶稳','steady-bowl','food','boy']],
 E02:[['拨了一下头发','brush-hair','none','girl'],['向各自等着的人走去','leave-separately','notebook','girl'],['小梦走下台阶','farewell-pack','water','girl']],
 E03:[['并肩走到路口','walk-together','notebook','boy'],['最后落回了口袋','reach-and-stop','notebook','boy'],['小梦上车','board-and-wave','bag','girl'],['他举手时','last-wave','bag','boy'],['手放回口袋','pocket-and-walk','bag','boy','solo']],
 E04:[['小五戴好耳机','put-earbuds','earbuds','boy','solo'],['手机亮了一下','check-message','phone','boy','solo'],['小五把手机收起','pocket-and-walk','phone','boy','solo'],['便推门进去','enter-diner','food','boy','solo'],['退出播放页','stop-playback','phone','boy','solo'],['走上车站出口','climb-steps','bag','boy','solo'],['他坐下来','sit-and-order','food','boy','solo']]
};

export function latestDirection(node,state) {
 let found=null;
 for(let i=0;i<=state.index;i++){
  const beat=state.queue[i];
  if(!['action','narration'].includes(beat.kind))continue;
  const match=sceneDirections[node.id]?.find(([text])=>beat.text.includes(text));
  if(match){const [,profile,object,actor,mode]=match;found={profile,object,actor,mode,index:i,id:beat.id};}
 }
 return found;
}
