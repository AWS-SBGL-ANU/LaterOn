import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const root=path.resolve(import.meta.dirname,'..');
const queue=JSON.parse(fs.readFileSync(path.join(root,'Later_On_Architecture_Package/docs/CRAYON_REDRAW_QUEUE.json'),'utf8'));
const style=fs.readFileSync(path.join(root,'reference-preview/crayon-style-prompt.txt'),'utf8');

export function crayonPrompt(id){
 const shot=queue.find(item=>item.id===id);
 if(!shot)throw Error(`Unknown shot ${id}`);
 const setting=shot.brief.match(/环境：([^。]*)/)?.[1]?.split('，')[0]??'';
 const brief=shot.brief.replace(/环境：.*?。。/g,'');
 let continuity='Use ONLY the reference character identities and drawing medium. Create the poses and props for this current story moment. No unrelated cap, bottle or earbud. Any visible head, including all hair, must fit inside the frame with at least 12% backdrop above it. If a proposed closeup would cut a head, widen the camera.';
 if(shot.nodeId==='S01'){
  continuity+=' NIGHT on concrete school bleachers, dark dusty blue-gray sky. No orange sunset, no daylight. Only two broad concrete steps and vague tree shapes, no elaborate stage, railings or light strings.';
  continuity+=shot.phase==='A'?' Both sit together, each wearing one wired earbud.':shot.phase==='C'?' Boy walks down steps and looks back; girl stays seated with spare earbud. Boy wears NO earbud.':' Only girl wears one earbud and holds the spare. Boy has not accepted it yet.';
 }
 if(shot.nodeId==='S02'){
  continuity+=' No real cat or animal in this classroom. No cap, bottle or earbud. This is a notebook-and-pen scene.';
  if(shot.phase==='C')continuity+=' The notebook is CLOSED in this choice. Boy holds its CLOSED cover, no open pages or visible doodles. The two exchange a playful look.';
  else if(shot.phase==='B')continuity+=' An ink drawing of a six-legged CAT is ON THE NOTEBOOK PAGE beside a tiny teacher head with glasses. The cat is a flat doodle, never a living animal. Do not give the teacher extra legs.';
  else continuity+=' The teacher doodle is ONLY a tiny HEAD with glasses on the notebook page, no body and no extra legs. Girl slides the notebook toward the boy when the action requires it.';
 }
 return `${continuity}\n${style}\nSHOT ${id}. Minimal setting: ${setting}. Story context only, do not paint any dialogue or instructions: ${brief}\n${continuity}`;
}

// This outputs a prompt only. Generation still requires the ORIGINAL user image
// as a supported imagegen reference; displaying it in a tool does not prove that
// the generator received it. Never silently switch to the previous generated image.
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 console.log(crayonPrompt(process.argv[2]));
}
