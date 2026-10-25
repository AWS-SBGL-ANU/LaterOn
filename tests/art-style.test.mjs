import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {artStyle} from '../src/data/artStyle.mjs';
import {tiles,actionTiles,sketchSheets,tileArt,backgroundArt} from '../src/domain/presentation.mjs';
import {puppetSheet} from '../src/domain/choreography.mjs';
const root=new URL('../',import.meta.url);
const read=path=>fs.readFileSync(new URL(path,root));
const hash=data=>crypto.createHash('sha256').update(data).digest('hex');

test('The titled cover, every background and every action resolve to the same active art pack',()=>{
 const cover=read(`public/${artStyle.cover}`);
 assert.equal(cover.toString('hex',0,8),'89504e470d0a1a0a');
 assert.ok(read('README.md').toString().includes(`](public/${artStyle.cover})`));
 for(const [id,[sheet,index]] of [...Object.entries(tiles),...Object.entries(actionTiles)]){
  const art=tileArt(id,sheet,index,'./');
  assert.equal(art.styleId,artStyle.id);
  assert.equal(art.url,`./${artStyle.sheetDirectory}${sheet}.png`);
 }
 for(const era of ['high','university','adult'])assert.equal(backgroundArt({backgroundId:'BG22'},{era}).styleId,artStyle.id);
});

test('All nine story sheets and the animation source are newly drawn files, not renamed old artwork',()=>{
 assert.equal(sketchSheets.length,9);
 for(const sheet of sketchSheets){
  const fresh=read(`public/${artStyle.sheetDirectory}${sheet}.png`),old=read(`public/art/sketch/${sheet}.png`);
  assert.equal(fresh.toString('hex',0,8),'89504e470d0a1a0a');
  assert.notEqual(hash(fresh),hash(old),`${sheet} must be actually redrawn`);
 }
 assert.notEqual(hash(read(`public/${puppetSheet}`)),hash(read('public/art/puppets/parts.png')));
});

test('Animated heads, sleeves, hands, torsos, legs and props use the cover-style source with valid measured bounds',()=>{
 const bounds=JSON.parse(read('src/data/puppetParts.json')),png=read(`public/${puppetSheet}`);
 assert.equal(bounds.styleId,artStyle.id);assert.equal(puppetSheet,artStyle.puppet);
 assert.equal(png.readUInt32BE(16),bounds.width);assert.equal(png.readUInt32BE(20),bounds.height);assert.equal(png[25],6);
 assert.equal(Object.keys(bounds.crops).length,16);
 for(const [key,[x,y,width,height]] of Object.entries(bounds.crops)){
  assert.ok([x,y,width,height].every(Number.isInteger),key);
  assert.ok(x>=0&&y>=0&&width>0&&height>0&&x+width<=bounds.width&&y+height<=bounds.height,key);
 }
 for(const who of ['boy','girl'])for(const part of ['head','eyes-closed','body','inner','outer','leg-left','leg-right'])assert.ok(bounds.crops[`${who}-${part}`]);
});
