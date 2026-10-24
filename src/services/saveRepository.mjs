import { validateSave } from '../domain/engine.mjs';
export const SAVE_KEY='hou-lai-ne.save.v1';
export const ENDINGS_KEY='hou-lai-ne.endings.v1';
export class SaveConflict extends Error {}
export class SaveRepository {
 constructor(storage,story){this.storage=storage;this.story=story;this.revision=null;this.slot=storage.getItem('hou-lai-ne.latest')||'main';}
 key(){return this.slot==='main'?SAVE_KEY:`${SAVE_KEY}.${this.slot}`;}
 load(){const text=this.storage.getItem(this.key());if(!text){this.revision=null;return null;}const envelope=JSON.parse(text);this.revision=envelope.token;return validateSave(this.story,envelope.state);}
 save(state){
  const old=this.storage.getItem(this.key());const token=old?JSON.parse(old).token:null;
  if(token!==this.revision)throw new SaveConflict('另一个标签页更新了这个存档。可重新载入，或另存为独立进度。');
  const next=crypto.randomUUID();
  this.storage.setItem(this.key(),JSON.stringify({token:next,savedAt:Date.now(),state}));this.revision=next;
  this.storage.setItem('hou-lai-ne.latest',this.slot);
 }
 fork(){this.slot=crypto.randomUUID();this.revision=null;}
 import(text){if(text.length>3_000_000)throw Error('存档文件过大。');return validateSave(this.story,JSON.parse(text));}
 endings(){try{return JSON.parse(this.storage.getItem(ENDINGS_KEY)||'[]').filter(x=>/^E0[1-4]$/.test(x));}catch{return [];}}
 unlock(id){const seen=this.endings();if(!seen.includes(id))this.storage.setItem(ENDINGS_KEY,JSON.stringify([...seen,id]));}
}
