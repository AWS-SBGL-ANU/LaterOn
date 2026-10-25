const ready = new Map<string,Promise<HTMLImageElement>>();
export function prepareArt(url:string){
 if(ready.has(url))return ready.get(url)!;
 const promise=new Promise<HTMLImageElement>((resolve,reject)=>{
  const image=new Image();const timer=setTimeout(()=>{ready.delete(url);reject(Error('插画加载超时，请重试。'));},18000);
  image.onload=async()=>{try{await image.decode();clearTimeout(timer);resolve(image);}catch(error){clearTimeout(timer);ready.delete(url);reject(error);}};
  image.onerror=()=>{clearTimeout(timer);ready.delete(url);reject(Error('这张插画未能加载。'));};image.src=url;
 });
 ready.set(url,promise);
 // Keep the nine current sketch sheets warm across nearby scenes and branches.
 if(ready.size>12)ready.delete(ready.keys().next().value!);
 return promise;
}
