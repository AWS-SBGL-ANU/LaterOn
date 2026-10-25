// A drawing is held until the next authored action. These cues only animate
// characters; they never mutate the story, start a countdown or select a route.
import { artStyle } from '../data/artStyle.mjs';
export const puppetSheet = artStyle.puppet;
import { latestDirection } from './sceneDirections.mjs';

// [action, object, staging]. Each option has its own visual response; distant
// conversations stay in separate spaces, including when the response is warm.
export const choicePerformances = {
 S01:{A:['sit-close','earbuds'],B:['offer','earbuds'],C:['leave','chair']},
 S02:{A:['show','notebook'],B:['write','notebook'],C:['close','notebook']},
 S15:{A:['nod','pen'],B:['smile','pen'],C:['offer','eraser']},
 S03:{A:['offer','notebook'],B:['pause','notebook'],C:['write','notebook']},
 S04:{A:['invite','ball'],B:['listen','microphone'],C:['nod','microphone']},
 S05:{A:['offer','water'],B:['invite','food'],C:['listen','ball']},
 S16:{A:['offer','icecream'],B:['listen','icecream'],C:['offer','tissue']},
 S17:{A:['receive','icecream'],B:['offer','spoon'],C:['smile','icecream']},
 S06:{A:['approach','umbrella'],B:['receive','tissue'],C:['show','phone']},
 S18:{A:['rest','thermos'],B:['invite','notebook'],C:['write','notebook']},
 S19:{A:['wake','bag'],B:['listen','bag'],C:['offer','bag']},
 S07:{A:['show','application'],B:['listen','application'],C:['close','application']},
 S20:{A:['invite','food'],B:['receive','star'],C:['listen','notebook']},
 S08:{A:['listen','chopsticks'],B:['invite','chopsticks'],C:['pause','chopsticks']},
 S09:{A:['show','application'],B:['pause','application'],C:['apart','application']},
 S10:{A:['listen','breakfast'],B:['show','phone'],C:['listen','phone']},
 S11:{A:['write','calendar','remote'],B:['listen','phone','remote'],C:['wave','phone','remote']},
 S12:{A:['show','phone','remote'],B:['write','phone','remote'],C:['close','phone','remote']},
 S13:{A:['listen','drink'],B:['smile','drink'],C:['apart','drink']},
 S14:{A:['write','calendar','remote'],B:['pause','calendar','remote'],C:['apart','calendar','remote']},
 B01:{A:['listen','drink'],B:['apart','drink']},
 B02:{A:['write','calendar'],B:['listen','calendar']},
 B03:{A:['listen','none'],B:['listen','none'],C:['apart','none']},
 B04:{A:['smile','microphone','remote'],B:['show','food','remote']},
 B05:{A:['listen','phone','remote'],B:['smile','microphone','remote']},
 B06:{A:['show','phone','remote'],B:['pause','phone','remote'],C:['apart','phone','remote']},
 B07:{A:['close','tools','remote'],B:['leave','food','remote'],C:['show','phone','remote']},
 B08:{A:['write','calendar','remote'],B:['pause','application','remote'],C:['apart','application','remote']},
 B09:{A:['write','calendar','remote'],B:['pause','calendar','remote'],C:['apart','calendar','remote']},
 B10:{A:['show','application'],B:['close','application'],C:['apart','application']},
 B11:{A:['listen','umbrella'],B:['apart','umbrella'],C:['pause','phone','remote']},
 F01:{A:['show','drink'],B:['listen','drink']},
 D01:{A:['wave','phone','remote'],B:['pack','notebook','remote']},
 D02:{A:['pause','phone','remote'],B:['close','phone','remote']},
 D03:{A:['write','calendar'],B:['show','keys']},
 E01:{A:['leave','keys'],B:['receive','spoon']},
 E02:{A:['pause','notebook'],B:['wave','notebook']},
 E03:{A:['wave','bag'],B:['leave','bag','solo']},
 E04:{A:['show','phone','solo'],B:['close','phone','solo']}
};

const actionCues = {
 'pen-offer':['offer','pen'], 'school-fingers':['touch','pen'],
 'pen-fall':['drop','pen'], 'pen-floor':['floor','pen'],
 'pen-reach':['bend','pen'], 'pen-near':['look','pen'],
 'pen-pickup':['pickup','pen'], 'pen-writing':['write','notebook'],
 'bench-pass':['offer','icecream'], 'bench-spoon':['scoop','icecream'],
 'school-share-icecream':['taste','icecream'], 'bench-shy':['shy','icecream'],
 'thermos-pour':['pour','thermos'], 'school-thermos':['warm','thermos'],
 'bus-offer':['offer-shoulder','bag'], 'school-shoulder':['lean','bag'],
 'bus-awake':['wake','bag'], 'hand-offer':['offer-hand','none'],
 'school-handhold':['hold-hands','none'], 'school-listen':['sit-close','earbuds'],
 'airport-zip':['zip','bag'], 'airport-breakfast':['offer','breakfast'],
 'airport-open':['open-arms','none'], 'airport-step':['approach','none'],
 'airport-hug':['hug','none'], 'airport-hold':['embrace','none'],
 'airport-release':['release','none'], 'airport-selfie':['selfie','phone'],
 'bridge-hug':['hug','none'], 'university-reunion':['hug','none'],
 'adult-groceries':['share-bag','groceries'], 'adult-cook':['cook','food'],
 'kitchen-spoon':['offer','spoon'], 'notebook-return':['pack','notebook']
};

function settingFor(node) {
 if(['S10'].includes(node.id))return 'airport';
 if(['S19'].includes(node.id))return 'bus';
 if(['S16','S17'].includes(node.id))return 'bench';
 if(['S06','B11'].includes(node.id))return 'rain';
 if(['S08','B02','B10','D03','E01'].includes(node.id))return 'table';
 if(['S02','S03','S07','S15','S18','S20'].includes(node.id))return 'desk';
 if(node.id==='B03')return 'bridge';
 if(['S04','S05','B01','S13'].includes(node.id))return 'outside';
 return 'bench';
}

// Cues inside one formerly static action are separated by the puppet timeline.
// Intimacy starts only on the corresponding authored action, after its consent
// dialogue. In particular, selecting a hug option initially means listening.
function authoredAction(node, state, art) {
 const beat=state.queue[state.index];
 const seen=state.queue.slice(0,state.index+1);
 const lastAction=seen.findLast(b=>b.kind==='action');
 if(['response','completed'].includes(state.phase)) {
  if(node.id==='S01'&&lastAction)return ['sit-close','earbuds'];
  if(node.id==='S07'&&state.decisions.S07==='C'&&lastAction)return ['pinky','application'];
  if(node.id==='S08'&&state.decisions.S08==='A') {
   if(seen.some(b=>b.kind==='action'&&b.text.includes('手掌摊')))return ['hold-hands','none'];
   if(lastAction)return ['offer','chopsticks'];
  }
  if(node.id==='B01'&&state.decisions.B01==='A'&&seen.some(b=>b.art==='school-handhold'))return ['hold-hands','none'];
  if(node.id==='B03'&&state.decisions.B03==='B') {
   if(lastAction?.text.includes('抱住'))return ['hug','none'];
   return null;
  }
  if(node.id==='S13'&&state.decisions.S13==='A') {
   if(lastAction?.text.includes('怀里'))return ['hug','none'];
   return null;
  }
  if(node.id==='S10'&&state.decisions.S10==='A'&&!lastAction)return null;
  if(node.id==='D03'&&state.decisions.D03==='A'&&seen.some(b=>b.art==='adult-cook'))return ['cook','food'];
  if(node.id==='B11'&&state.decisions.B11==='A'&&seen.some(b=>b.art==='adult-groceries'))return ['share-bag','groceries'];
  // A fresh response gets its own props rather than inheriting a previous hug,
  // asleep pose or dropped object from the dialogue.
  if(!beat?.art)return null;
 }
 return actionCues[art.id]??null;
}

export function performanceFor(node,state,art) {
 const responding=['response','completed'].includes(state.phase);
 const choice=responding?choicePerformances[node.id]?.[state.decisions[node.id]]:null;
 const authored=authoredAction(node,state,art);
 let cue=authored??choice;
 const direction=latestDirection(node,state);
 const artStart=state.queue.slice(0,state.index+1).findLastIndex((b,i)=>b.art&&b.art!==state.queue[i-1]?.art);
 const directed=direction&&direction.index>=artStart?direction:null;
 if(directed)cue=[['hug','embrace','release','lean','wake','offer-shoulder','approach','open-arms','hold-hands','pinky'].includes(directed.profile)
  ?directed.profile:cue?.[0]??directed.profile,directed.object,directed.mode??cue?.[2]??'together'];
 if(!cue)return null;
 const [action,object,mode='together']=cue;
 const marker=directed?.id??state.queue.slice(0,state.index+1).findLast((b,i)=>
  b.kind==='action'||b.art&&b.art!==state.queue[i-1]?.art)?.id;
 const onset=marker?state.queue.findIndex(b=>b.id===marker):0;
 return {action,object,mode,setting:directed?.profile==='walk-together'?'outside':settingFor(node),
  // Stay on one key through regular dialogue, without repeating an action.
  key:`${node.id}:${responding?state.decisions[node.id]:'dialogue'}:${directed?.profile??action}:${marker??'start'}`,
  onset,profile:directed?.profile,
  settled:['choosing','completed'].includes(state.phase)||state.index>onset,
  era:state.facts.era, actor:directed?.actor??(['pen-offer','school-thermos','school-share-icecream','bench-spoon','airport-zip','airport-breakfast'].includes(art.id)
   ||node.id==='S08'&&object==='chopsticks'||node.id==='S01'&&action==='offer'?'girl':'boy')};
}

export function artDependencies(art,base='/') {
 return art.performance?[art.url,`${base}${puppetSheet}`]:[art.url];
}
