import { advance, choose, current, matches } from './engine.mjs';
import {artStyle} from '../data/artStyle.mjs';
import storyboard from '../data/storyboards.json' with {type:'json'};

// Nine equal landscape panels per sheet; CSS positions are 0%, 50%, 100%.
export const tiles = {
 BG01:['school',0], BG02:['school',2], BG03:['school',3], BG04:['school',4],
 BG05:['school',5], BG06:['tender',2], BG07:['school',7], BG08:['promises',0],
 BG09:['promises',4], BG10:['departure',0], BG11:['distance',0], BG12:['distance',1],
 BG13:['promises',6], BG14:['distance',2], BG15:['promises',8], BG16:['distance',3],
 BG17:['distance',4], BG18:['distance',5], BG19:['distance',6], BG20:['distance',7],
 BG21:['later',0], 'BG22-high':['later',1], 'BG22-university':['later',2], 'BG22-adult':['later',3],
 BG23:['later',4], BG24:['later',5], BG25:['later',6], BG26:['later',7], BG27:['later',8],
 BG28:['pen',0], BG29:['tender',0], BG30:['bench',0], BG31:['tender',3],
 BG32:['tender',6], BG33:['school',7]
};

export const actionTiles = {
 'school-listen':['school',1], 'school-water':['school',6],
 'pen-offer':['pen',1], 'school-fingers':['pen',2], 'pen-fall':['pen',3],
 'pen-floor':['pen',4], 'pen-reach':['pen',5], 'pen-near':['pen',6],
 'pen-pickup':['pen',7], 'pen-writing':['pen',8],
 'school-buy-icecream':['tender',1],
 'bench-ask':['bench',1], 'bench-pass':['bench',2], 'bench-spoon':['bench',3],
 'school-share-icecream':['bench',4], 'bench-shy':['bench',5],
 'bench-talk':['bench',6], 'bench-cup':['bench',7], 'bench-smile':['bench',8],
 'school-umbrella':['tender',2], 'thermos-pour':['tender',4], 'school-thermos':['tender',5],
 'bus-awake':['tender',6], 'bus-offer':['tender',7], 'school-shoulder':['tender',8],
 'school-paperstar':['school',8], 'school-confession':['promises',1],
 'hand-offer':['promises',2], 'school-handhold':['promises',3],
 'airport-zip':['departure',1], 'airport-breakfast':['departure',2],
 'airport-open':['departure',3], 'airport-step':['departure',4],
 'airport-hug':['departure',5], 'airport-hold':['departure',6],
 'airport-release':['departure',7], 'airport-itinerary':['departure',8],
 'airport-selfie':['endings',5], 'bridge-hug':['promises',5],
 'university-reunion':['promises',7], 'adult-groceries':['distance',8],
 'adult-cook':['later',5], 'kitchen-spoon':['endings',0], 'adult-calendar':['endings',7],
 'notebook-return':['endings',8], 'metro-exit':['endings',4]
};

export const sketchSheets = ['pen','bench','school','tender','departure','promises','distance','later','endings'];

export function tileArt(id, sheet, index, base = '/') {
 return { id, sheet, index, styleId:artStyle.id, boySide:'right', size:'300% 300%',
  url:`${base}${artStyle.sheetDirectory}${sheet}.png`, position:`${index % 3 * 50}% ${Math.floor(index / 3) * 50}%` };
}

export function backgroundArt(node, facts, base = '/') {
 const id = node.backgroundId === 'BG22' ? `BG22-${facts.era}` : node.backgroundId;
 const [sheet,index] = tiles[id];
 return tileArt(id,sheet,index,base);
}

function illustrationArt(node, state, base = '/') {
 // Keep the final dialogue shot after choosing; do not reset objects and poses.
 const dialogueArt = ['response','completed'].includes(state.phase)
  ? node.beats.filter(beat => matches(beat.when,state)).findLast(beat => beat.art)?.art : null;
 const action = state.queue.slice(0,state.index + 1).findLast(beat => beat.art)?.art ?? dialogueArt;
 const closing = state.phase === 'completed' || state.phase === 'response' &&
  state.queue.slice(0,state.index + 1).some(beat => beat.kind === 'action' && beat.id?.includes('-r-'));
 if (closing && node.id === 'E01') {
  const choice = state.decisions.E01;
  return tileArt(`E01-finale-${choice}`,'endings',choice === 'A' ? 1 : 2,base);
 }
 if (closing && node.id === 'E03') return tileArt('E03-finale','endings',3,base);
 if (action && actionTiles[action]) {
  const [sheet,index] = actionTiles[action];
  return tileArt(action,sheet,index,base);
 }
 return backgroundArt(node,state.facts,base);
}

export function sceneArt(node,state,base='/') {
 const pages=storyboard.nodes[node.id];
 const response=['response','completed'].includes(state.phase);
 const sequence=response?pages?.responses[state.decisions[node.id]]:pages?.dialogue;
 const shot=storyboard.shots[sequence?.[current(state)?.id]];
 const art=shot?{...tileArt(shot.id,shot.sheet,shot.index,base),
  url:`${base}${storyboard.directory}${shot.sheet}.png`,storyboard:true}:illustrationArt(node,state,base);
 return {...art,eventId:illustrationArt(node,state,base).id,key:art.id};
}

// Static scenes preload the finished illustration only.
export function artDependencies(art) {return [art.url];}

function plan(story, state, next, base) {
 const node = story.nodes[next.nodeId], art = sceneArt(node,next,base);
 return { node, art, beat:current(next),
  artChanged:art.key !== sceneArt(story.nodes[state.nodeId],state,base).key,
  crossScene:state.nodeId !== next.nodeId &&
   (backgroundArt(node,next.facts,base).id !== backgroundArt(story.nodes[state.nodeId],state.facts,base).id || ['B08','B10'].includes(node.id)) };
}

export function planAdvance(story, state, base = '/') {
 const next = structuredClone(state);
 if (!advance(story,next)) return null;
 return plan(story,state,next,base);
}

export function planChoice(story, state, choice, base = '/') {
 const next = structuredClone(state);
 if (!choose(story,next,choice)) return null;
 return plan(story,state,next,base);
}
