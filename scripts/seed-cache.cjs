const fs = require('node:fs/promises');
const cache = require('D:/新建文件夹/node_modules/npm/node_modules/cacache');
const source = 'C:/Users/33265/AppData/Local/npm-cache/_cacache';
const target = '.npm-cache/_cacache';
const lock = require('../../SECOND NATURE/SECOND NATURE/package-lock.json');
const allowed = new Set(Object.keys(lock.packages).map(x => x.replace(/^.*node_modules\//, '')));
for (const x of ['vue','pinia','vite','typescript','vue-tsc','@vitejs/plugin-vue']) allowed.add(x);
(async () => {
const entries = await cache.ls(source);
let count = 0;
for (const [key, info] of Object.entries(entries)) {
  if (!key.startsWith('make-fetch-happen:request-cache:https://registry.npmjs.org/')) continue;
  const path = decodeURIComponent(key.replace('make-fetch-happen:request-cache:https://registry.npmjs.org/',''));
  const name = path.split('/-/')[0];
  if (!allowed.has(name)) continue;
  try { const entry = await cache.get(source,key); await cache.put(target,key,entry.data,{metadata:info.metadata}); count++; } catch {}
}
console.log(`Copied ${count} cached dependency entries.`);
})().catch(e => { console.error(e.message); process.exitCode=1; });
