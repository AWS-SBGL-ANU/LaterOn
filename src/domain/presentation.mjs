import { advance, current } from './engine.mjs';

export const tiles = {
 BG01:['school',0],BG02:['school',1],BG03:['school',2],BG04:['school',3],
 BG05:['school-days',0],BG06:['school-days',1],BG07:['school-days',2],BG08:['school-days',3],
 BG09:['apart',0],BG10:['apart',1],BG11:['apart',2],BG12:['apart',3],
 BG13:['university',0],BG14:['university',1],BG15:['university',2],BG16:['university',3],
 BG17:['promises',0],BG18:['promises',1],BG19:['promises',2],BG20:['promises',3],
 BG21:['adulthood',0],'BG22-high':['adulthood',1],'BG22-university':['adulthood',2],'BG22-adult':['adulthood',3],
 BG23:['endings',0],BG24:['moments-everyday',3],BG25:['endings',2],BG26:['endings',3],BG27:['metro',0],
 BG28:['moments-before',0],BG29:['moments-before',1],BG30:['moments-before',2],
 BG31:['moments-tender',1],BG32:['moments-before',3],BG33:['moments-tender',2]
};
tiles.BG06=['moments-tender',0];tiles.BG08=['moments-embrace',1];
tiles.BG02=['moments-classroom',0];tiles.BG03=['moments-classroom',1];tiles.BG04=['moments-classroom',2];
export const actionTiles={
 'school-fingers':['moments-school',0],'school-buy-icecream':['moments-school',1],
 'school-share-icecream':['moments-school',2],'school-shoulder':['moments-school',3],
 'school-umbrella':['moments-tender',0],'school-thermos':['moments-tender',1],
 'school-paperstar':['moments-tender',2],'school-handhold':['moments-tender',3],
 'school-listen':['moments-embrace',0],'school-confession':['moments-embrace',1],
 'airport-hug':['moments-embrace',2],'bridge-hug':['moments-embrace',3],
 'university-reunion':['moments-everyday',1],'adult-groceries':['moments-everyday',2],'adult-cook':['moments-everyday',3],
 'school-water':['moments-classroom',3]
};

export function backgroundArt(node, facts, base = '/') {
 const id = node.backgroundId === 'BG22' ? `BG22-${facts.era}` : node.backgroundId;
 const [sheet, index] = tiles[id];
 return tileArt(id, sheet, index, base);
}

function tileArt(id, sheet, index, base) {
 return {id, sheet, index, boySide:id==='school-buy-icecream'?'right':'left',url:`${base}art/atlases/${sheet}.png`, position:`${index % 2 ? 100 : 0}% ${index > 1 ? 100 : 0}%`};
}

export function sceneArt(node, state, base = '/') {
 const action=state.queue.slice(0,state.index+1).findLast(beat=>beat.art)?.art;
 if(action&&actionTiles[action]){const [sheet,index]=actionTiles[action];return tileArt(action,sheet,index,base);}
 // Keep the closing illustration during the final thought and after reloading.
 const closing = state.phase === 'completed' || state.phase === 'response' &&
  state.queue.slice(0, state.index + 1).some(beat => beat.kind === 'action' && beat.id?.includes('-r-'));
 if (closing && node.id === 'E01') {
  const choice = state.decisions.E01;
  return tileArt(`E01-finale-${choice}`, 'metro', choice === 'A' ? 2 : 1, base);
 }
 if (closing && node.id === 'E03') return tileArt('E03-finale', 'metro', 3, base);
 return backgroundArt(node, state.facts, base);
}

export function planAdvance(story, state, base = '/') {
 const next = structuredClone(state);
 if (!advance(story, next)) return null;
 const node = story.nodes[next.nodeId];
 const art = sceneArt(node, next, base);
 return {
  node, art, beat:current(next),
  artChanged:art.id !== sceneArt(story.nodes[state.nodeId], state, base).id,
  crossScene:state.nodeId !== next.nodeId &&
   (backgroundArt(node, next.facts, base).id !== backgroundArt(story.nodes[state.nodeId], state.facts, base).id || ['B08','B10'].includes(node.id))
 };
}
