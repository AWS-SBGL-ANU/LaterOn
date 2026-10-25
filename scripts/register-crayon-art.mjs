import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const at = file => path.join(root, file);
const manifestFile = at('src/data/individualArt.json');
const progressFile = at('Later_On_Architecture_Package/docs/INDIVIDUAL_ART_PROGRESS.json');
const styleId = 'crayon-master-20261025';
const master = 'reference-preview/crayon-master-20261025.png';
const referenceSha256 = crypto.createHash('sha256').update(fs.readFileSync(at(master))).digest('hex');
const boards = JSON.parse(fs.readFileSync(at('src/data/storyboards.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));

for (const [id, entry] of Object.entries(manifest)) {
  if (entry.styleId !== styleId) delete manifest[id];
}
for (const id of process.argv.slice(2)) {
  if (id !== 'cover' && !boards.shots[id]) throw Error(`Unknown shot: ${id}`);
  const file = `crayon-${id}.png`;
  const bytes = fs.readFileSync(at(`public/art/individual/${file}`));
  if (bytes.toString('hex', 0, 8) !== '89504e470d0a1a0a') throw Error(`Invalid PNG: ${file}`);
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  if (width < 1600 || height < 900 || Math.abs(width / height - 16 / 9) > 0.025) {
    throw Error(`Invalid independent landscape image: ${file} (${width} x ${height})`);
  }
  manifest[id] = {file, width, height, styleId, referenceSha256};
}
fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + '\n');
const completed = Object.keys(boards.shots).filter(id => manifest[id]?.styleId === styleId);
const remaining = Object.keys(boards.shots).filter(id => !completed.includes(id));
const progress = {
  updatedAt: new Date().toISOString(), styleId, reference: master, referenceSha256,
  total: Object.keys(boards.shots).length, completed, remaining,
  coverCompleted: manifest.cover?.styleId === styleId,
  note: 'Only independently generated, visually reviewed, manifest-listed wax-crayon images count as completed. Earlier styles do not count. Pending shots retain their legacy artwork. Actual native dimensions are stored per file; no upscaled image is counted as new detail. No browser, tests, build or deployment run.'
};
fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2) + '\n');
console.log(`${completed.length}/${progress.total} crayon story shots; cover: ${progress.coverCompleted ? 'complete' : 'pending'}`);
