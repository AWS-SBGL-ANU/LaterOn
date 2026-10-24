"""Render original loopable piano miniatures, without third-party recordings."""
import math, wave, array, pathlib
RATE=22050
OUT=pathlib.Path('public/audio'); OUT.mkdir(parents=True,exist_ok=True)
themes={
 'sunny':(112,[72,76,79,76,74,72,69,67,72,None,76,79,81,79,76,None,74,77,79,77,76,74,72,69,67,None,69,72,74,76,72,None],[[48,52,55],[53,57,60],[45,48,52],[55,59,62]]),
 'flutter':(94,[76,None,79,81,79,76,74,None,72,74,76,None,79,76,74,None,77,None,81,79,77,76,74,72,74,None,76,79,76,74,72,None],[[48,52,55],[45,48,52],[53,57,60],[55,59,62]]),
 'tender':(84,[72,None,76,None,74,72,69,None,67,None,69,72,76,None,74,None,72,None,77,76,74,72,69,None,67,None,69,72,74,None,72,None],[[48,52,55],[53,57,60],[45,48,52],[55,59,62]]),
 'distance':(76,[69,None,72,None,76,74,72,None,71,None,67,None,69,None,None,None,69,None,72,74,76,None,74,72,71,None,69,67,69,None,None,None],[[45,48,52],[53,57,60],[48,52,55],[52,55,59]]),
 'rain':(66,[69,None,None,72,71,None,69,None,67,None,64,None,67,None,None,None,65,None,69,None,72,71,69,None,68,None,71,None,69,None,None,None],[[45,48,52],[41,45,48],[50,53,57],[52,56,59]])
}
def render(name,bpm,melody,chords):
 beat=60/bpm; duration=32*beat; data=[0.0]*int(duration*RATE)
 def note(midi,start,length,level,soft=False):
  f=440*2**((midi-69)/12); offset=int(start*RATE); end=min(len(data),offset+int(length*RATE))
  for i in range(offset,end):
   t=(i-offset)/RATE
   env=min(1,t/(.08 if soft else .012))*max(0,min(1,(length-t)/.14))*math.exp(-t*(.65 if soft else 2.7))
   v=math.sin(2*math.pi*f*t)+(.08 if soft else .23)*math.sin(4*math.pi*f*t)+(.025 if soft else .07)*math.sin(6*math.pi*f*t)
   data[i]+=v*env*level
 for bar in range(8):
  chord=chords[bar%4]; start=bar*4*beat
  note(chord[0]-12,start,3.8*beat,.11,True)
  for j,key in enumerate(chord):
   note(key,start+j*.035,3.8*beat,.045,True)
   note(key+12,start+(j+.5)*beat,1.4*beat,.045)
  for step in range(8):
   key=melody[(bar*8+step)%len(melody)]
   if key is not None:note(key,start+step*beat/2,1.15*beat,.14 if name=='sunny' else .115)
 fade=int(RATE*.6); peak=max(abs(v) for v in data) or 1; pcm=array.array('h')
 for i,value in enumerate(data):
  edge=max(0,min(1,i/(RATE*.08),(len(data)-1-i)/fade))
  pcm.append(int(max(-1,min(1,value/peak*.74*edge))*32767))
 with wave.open(str(OUT/(name+'.wav')),'wb') as out:
  out.setnchannels(1);out.setsampwidth(2);out.setframerate(RATE);out.writeframes(pcm.tobytes())
 print(name,round(duration,2),'seconds',len(pcm),'samples')
for name,args in themes.items():render(name,*args)
