/* Beat original sintetizado: sem samples, faixas comerciais ou downloads de musica.
   Web Audio usa seu proprio relogio; o timer apenas agenda notas antecipadamente. */
export function createSonicWind(context){
 const master=context.createGain();master.gain.value=0;master.connect(context.destination);
 const radio=context.createBiquadFilter();radio.type='highpass';radio.frequency.value=90;
 const water=context.createBiquadFilter();water.type='lowpass';water.frequency.value=2300;water.Q.value=.7;
 radio.connect(water);water.connect(master);
 const buffer=context.createBuffer(1,context.sampleRate*2,context.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
 const noise=context.createBufferSource();noise.buffer=buffer;noise.loop=true;
 const filter=context.createBiquadFilter();filter.type='bandpass';filter.frequency.value=380;filter.Q.value=.45;
 const noiseGain=context.createGain();noiseGain.gain.value=.003;noise.connect(filter);filter.connect(noiseGain);noiseGain.connect(radio);noise.start();
 let enabled=false,reading=false,timer=0,beatTimer=0,step=0,nextNote=0,lastClick=-Infinity,enableToken=0;
 function voice(frequency,time,duration,volume,type='sine'){
  const osc=context.createOscillator(),gain=context.createGain();osc.type=type;osc.frequency.setValueAtTime(frequency,time);
  gain.gain.setValueAtTime(.0001,time);gain.gain.linearRampToValueAtTime(volume,time+.018);gain.gain.exponentialRampToValueAtTime(.0001,time+duration);
  osc.connect(gain);gain.connect(radio);osc.start(time);osc.stop(time+duration+.04);osc.onended=()=>{osc.disconnect();gain.disconnect();};return osc;
 }
 function percussion(time,volume,frequency,duration){
  const source=context.createBufferSource(),tone=context.createBiquadFilter(),gain=context.createGain();source.buffer=buffer;tone.type='bandpass';tone.frequency.value=frequency;tone.Q.value=1;
  gain.gain.setValueAtTime(volume,time);gain.gain.exponentialRampToValueAtTime(.0001,time+duration);source.connect(tone);tone.connect(gain);gain.connect(radio);source.start(time);source.stop(time+duration+.03);source.onended=()=>{source.disconnect();tone.disconnect();gain.disconnect();};
 }
 function schedule(){
  if(!enabled)return;
  const duration=60/82/4;
  while(nextNote<context.currentTime+.16){
   const slot=step%16,bar=Math.floor(step/16)%4,t=nextNote+(slot%2?.012:0);
   if([0,6,8,14].includes(slot)){const kick=voice(83,t,.19,.048);kick.frequency.exponentialRampToValueAtTime(43,t+.15);}
   if([3,7,10,15].includes(slot)){voice(710,t,.047,.012,'triangle');percussion(t,.009,1100,.055);}
   if([2,5,8,11,14].includes(slot))percussion(t,.008,3600,.07);
   if(slot===0||slot===10)voice(bar<2?110:87.307,t,.38,.019);
   if(slot===0||slot===7){const chord=bar<2?[220,261.626,329.628,493.883]:[174.614,220,261.626,391.995];chord.forEach((f,i)=>voice(f,t+i*.014,.95,.006));}
   step++;nextNote+=duration;
  }
 }
 return{
  setScene(inside){reading=!!inside;if(enabled)master.gain.setTargetAtTime(reading?.64:.72,context.currentTime,.45);water.frequency.setTargetAtTime(reading?480:2300,context.currentTime,.75);water.Q.setTargetAtTime(reading?1.05:.7,context.currentTime,.7);},
  playClick(kind='tap'){if(!enabled||context.currentTime-lastClick<.06)return;lastClick=context.currentTime;(kind==='enter'?[220,261.626,329.628]:[220,329.628]).forEach((f,i)=>voice(f,context.currentTime+i*.03,.4,.009));},
  async setEnabled(on){const token=++enableToken;enabled=on;clearTimeout(timer);clearInterval(beatTimer);beatTimer=0;if(on){await context.resume();if(token!==enableToken||!enabled)return;master.gain.setTargetAtTime(reading?.64:.72,context.currentTime,.2);nextNote=context.currentTime+.035;schedule();beatTimer=setInterval(schedule,100);}else{master.gain.setTargetAtTime(0,context.currentTime,.07);timer=setTimeout(()=>{if(!enabled)context.suspend().catch(()=>{});},260);}},
  modulate(energy,x){if(!enabled)return;const e=Math.max(0,Math.min(1,energy));noiseGain.gain.setTargetAtTime(.0028+e*.004,context.currentTime,.25);filter.frequency.setTargetAtTime(270+e*190+x*50,context.currentTime,.4);water.frequency.setTargetAtTime((reading?450:2200)+e*(reading?80:180),context.currentTime,.55);}
 };
}
