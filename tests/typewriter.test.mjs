import test from 'node:test';
import assert from 'node:assert/strict';
import {createTypewriter} from '../src/domain/typewriter.mjs';

function setup(){
 const tasks=new Map();let id=0;const frames=[];
 const writer=createTypewriter((text,typing)=>frames.push({text,typing}),{
  schedule:fn=>{tasks.set(++id,fn);return id;},cancel:id=>tasks.delete(id)
 });
 function tick(){const entry=tasks.entries().next().value;if(!entry)return;tasks.delete(entry[0]);entry[1]();}
 return {writer,tasks,frames,tick,last:()=>frames.at(-1)};
}

test('Dialogue reveals one character per tick and finishes only at the last character',()=>{
 const t=setup();t.writer.start('你好呀');assert.deepEqual(t.last(),{text:'',typing:true});
 t.tick();assert.deepEqual(t.last(),{text:'你',typing:true});
 t.tick();assert.equal(t.last().text,'你好');t.tick();assert.deepEqual(t.last(),{text:'你好呀',typing:false});assert.equal(t.tasks.size,0);
});
test('A reveal click completes the current line and cancels its pending tick',()=>{
 const t=setup();t.writer.start('今天坐这儿。');t.tick();t.writer.finish();
 assert.deepEqual(t.last(),{text:'今天坐这儿。',typing:false});assert.equal(t.tasks.size,0);
 t.tick();assert.equal(t.last().text,'今天坐这儿。');
});
test('Switching speaker discards the old timer and a paused menu resumes the same line',()=>{
 const t=setup();t.writer.start('男生说话');t.tick();t.writer.start('女生说话');
 assert.equal(t.tasks.size,1);t.tick();assert.equal(t.last().text,'女');
 t.writer.pause(true);assert.equal(t.tasks.size,0);t.tick();assert.equal(t.last().text,'女');
 t.writer.pause(false);t.tick();assert.equal(t.last().text,'女生');
 t.writer.dispose();assert.equal(t.tasks.size,0);
});
test('Instant text and unicode symbols remain readable without pending animation',()=>{
 const t=setup();t.writer.start('慢慢读 ♡',true);assert.deepEqual(t.last(),{text:'慢慢读 ♡',typing:false});assert.equal(t.tasks.size,0);
 t.writer.start('🙂好');t.tick();assert.equal(t.last().text,'🙂');t.tick();assert.equal(t.last().text,'🙂好');
});
