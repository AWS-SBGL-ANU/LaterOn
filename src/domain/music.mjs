export function moodFor(node,state){
 const id=node?.id,choice=state?.decisions?.[id];
 if(state?.phase==='response'){
  if(id==='S05')return 'tender';
  if(id==='S08'&&choice==='C'||id==='B01'&&choice==='B'||id==='S13'&&choice==='B')return 'distance';
  if(id==='B11'&&choice==='B')return 'rain';
  if(id==='S13'&&choice==='A')return 'flutter';
 }
 if(['D02','D01','B06','B09','S05'].includes(id))return 'rain';
 if(['E02','E03','E04','S09','S10','S14','B03','B10'].includes(id))return 'distance';
 if(['S18','S19','B04','B05','B07','B11','D03','E01'].includes(id))return 'tender';
 if(['S02','S03','S04','S16','S11'].includes(id))return 'sunny';
 return 'flutter';
}
