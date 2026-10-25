// Read-only PNG pixel analysis: measure generated transparent parts without
// resampling, recoloring or otherwise modifying the source illustration.
import fs from 'node:fs';
import zlib from 'node:zlib';
import {artStyle} from '../src/data/artStyle.mjs';
const arms=process.argv.includes('--arms'),columns=arms?2:4,rows=arms?2:4;
const png=fs.readFileSync(new URL(`../public/${arms?artStyle.arms:artStyle.puppet}`,import.meta.url));
const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
if(png.toString('hex',0,8)!=='89504e470d0a1a0a'||png[24]!==8||png[25]!==6||png[28]!==0)throw Error('Expected a non-interlaced 8-bit RGBA PNG');
const blocks=[];
for(let offset=8;offset<png.length;){const length=png.readUInt32BE(offset),tag=png.toString('ascii',offset+4,offset+8);if(tag==='IDAT')blocks.push(png.subarray(offset+8,offset+8+length));offset+=12+length;}
const packed=zlib.inflateSync(Buffer.concat(blocks)),stride=width*4,pixels=Buffer.alloc(stride*height);
function paeth(a,b,c){const p=a+b-c,da=Math.abs(p-a),db=Math.abs(p-b),dc=Math.abs(p-c);return da<=db&&da<=dc?a:db<=dc?b:c;}
for(let y=0;y<height;y++){
 const filter=packed[y*(stride+1)],start=y*stride;
 for(let x=0;x<stride;x++){
  const raw=packed[y*(stride+1)+1+x],left=x>=4?pixels[start+x-4]:0,up=y?pixels[start-stride+x]:0,corner=y&&x>=4?pixels[start-stride+x-4]:0;
  const prediction=filter===0?0:filter===1?left:filter===2?up:filter===3?Math.floor((left+up)/2):filter===4?paeth(left,up,corner):NaN;
  if(!Number.isFinite(prediction))throw Error('Unknown PNG row filter');
  pixels[start+x]=(raw+prediction)&255;
 }
}
const names=arms?['girl-upper','boy-upper','girl-lower','boy-lower']:['girl-head','boy-head','girl-eyes-closed','boy-eyes-closed','girl-body','boy-body','girl-inner','boy-inner','girl-outer','boy-outer','girl-leg-left','girl-leg-right','boy-leg-left','boy-leg-right','pen','icecream'];
const crops={};
for(let index=0;index<names.length;index++){
 const x0=Math.floor(index%columns*width/columns),x1=Math.floor((index%columns+1)*width/columns),y0=Math.floor(Math.floor(index/columns)*height/rows),y1=Math.floor((Math.floor(index/columns)+1)*height/rows);
 const seen=new Uint8Array((x1-x0)*(y1-y0)),stack=new Int32Array(seen.length),cellWidth=x1-x0;
 let largest={count:0,left:x1,top:y1,right:x0,bottom:y0};
 // Keep the primary connected part, ignoring small stray pencil flecks or the
 // faint edge of a neighbouring head at a nominal grid boundary.
 for(let sy=y0;sy<y1;sy++)for(let sx=x0;sx<x1;sx++){
  const seed=(sy-y0)*cellWidth+sx-x0;
  if(seen[seed]||pixels[(sy*width+sx)*4+3]<128)continue;
  let length=1;stack[0]=seed;seen[seed]=1;
  const part={count:0,left:sx,top:sy,right:sx,bottom:sy};
  while(length){
   const point=stack[--length],x=x0+point%cellWidth,y=y0+Math.floor(point/cellWidth);
   part.count++;part.left=Math.min(part.left,x);part.top=Math.min(part.top,y);part.right=Math.max(part.right,x);part.bottom=Math.max(part.bottom,y);
   for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){
    const nx=x+dx,ny=y+dy;if(nx<x0||nx>=x1||ny<y0||ny>=y1)continue;
    const next=(ny-y0)*cellWidth+nx-x0;
    if(!seen[next]&&pixels[(ny*width+nx)*4+3]>=128){seen[next]=1;stack[length++]=next;}
   }
  }
  if(part.count>largest.count)largest=part;
 }
 let {left,top,right,bottom,count}=largest;
 if(count<80)throw Error('Empty character part '+names[index]);
 left=Math.max(x0,left-3);top=Math.max(y0,top-3);right=Math.min(x1-1,right+3);bottom=Math.min(y1-1,bottom+3);
 crops[names[index]]=[left,top,right-left+1,bottom-top+1];
}
const manifest={styleId:artStyle.id,width,height,columns,rows,crops};
fs.writeFileSync(new URL(arms?'../src/data/armSegments.json':'../src/data/puppetParts.json',import.meta.url),JSON.stringify(manifest,null,2)+'\n');
let coloredFringe=0;
for(let offset=0;offset<pixels.length;offset+=4)if(pixels[offset+3]>96&&pixels[offset]>200&&pixels[offset+1]<90&&pixels[offset+2]<90)coloredFringe++;
console.log(JSON.stringify({width,height,parts:names.length,opaqueRedPixels:coloredFringe,crops},null,2));
