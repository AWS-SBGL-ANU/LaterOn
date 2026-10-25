// Motion belongs to the visible drawing, never to a timer that advances the story.
// Coordinates are percentages of one 16:9 panel, independent of the atlas crop.
const closeups = new Set(['school-fingers','pen-near','bench-spoon','school-share-icecream','school-handhold']);
const approaches = new Set(['pen-offer','bench-pass','bus-offer','hand-offer','airport-open','airport-step']);
const rests = new Set(['pen-writing','bench-smile','school-shoulder','airport-hug','airport-hold','bridge-hug','university-reunion']);
const hearts = new Set(['pen-near','bench-shy','school-handhold']);

export function motionFor(art, node) {
 const id = art.id;
 return {
  camera: closeups.has(id) ? 'closer' : approaches.has(id) ? 'approach' : rests.has(id) ? 'settle' : 'still',
  heart: hearts.has(id),
  steam: id === 'thermos-pour' ? {x:64,y:64} : id === 'school-thermos' ? {x:40,y:64} : null,
  bus: ['BG32','bus-awake','bus-offer','school-shoulder'].includes(id),
  rain: ['BG06','BG20'].includes(node.backgroundId)
 };
}
