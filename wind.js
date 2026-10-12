/* Camada global de ondas: Canvas leve + um RAF, sem motor 3D.
   Apos o impulso, a energia cai ate o desenho parar. DPR limitado a 1.5. */
(()=>{
 const canvas=document.createElement('canvas');canvas.id='sonic-field';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);
 const ctx=canvas.getContext('2d');
 const cursor=document.createElement('div');cursor.id='signal-cursor';cursor.setAttribute('aria-hidden','true');cursor.innerHTML='<span class="signal-ring"></span><span id="signal-label"></span>';document.body.append(cursor);
 const dock=document.createElement('div');dock.className='sound-dock';dock.innerHTML='<button id="sound-toggle" aria-pressed="false" aria-label="Ativar vento sonoro"><span class="sound-bars" aria-hidden="true"><i></i><i></i><i></i></span><span id="sound-label" aria-live="polite">Som: desligado</span></button>';document.body.append(dock);
 const toggle=document.getElementById('sound-toggle'),label=document.getElementById('signal-label'),motion=matchMedia('(prefers-reduced-motion: reduce)');
 let w=innerWidth,h=innerHeight,x=w/2,y=h/2,px=x,py=y,energy=0,frame=0,last=0,hover=null,pointer=false,modulation=0,sound=null,soundOn=false,busy=false,context=null;
 function positionField(){
  const host=canvas.parentElement;
  if(host?.id==='track'){
   const transform=getComputedStyle(host).transform;let offset=0;
   const plane=host.parentElement;
   if(typeof DOMMatrix!=='undefined'&&plane?.id==='paper-plane'){
    const style=getComputedStyle(plane),origin=style.transformOrigin.split(' ').map(parseFloat),matrix=new DOMMatrix(style.transform==='none'?undefined:style.transform);
    const parent=new DOMMatrix().translate(origin[0]||0,origin[1]||0).multiply(matrix).translate(-(origin[0]||0),-(origin[1]||0));
    const trackMatrix=new DOMMatrix(transform==='none'?undefined:transform),gallery=document.getElementById('gallery');
    canvas.style.transform=parent.multiply(trackMatrix).inverse().translate(0,gallery?.scrollTop||0).toString();return;
   }
   if(transform.startsWith('matrix3d('))offset=Number(transform.slice(9,-1).split(',')[12]);
   else if(transform.startsWith('matrix('))offset=Number(transform.slice(7,-1).split(',')[4]);
   canvas.style.transform='translate3d('+(-offset)+'px,0,0)';
  }else if(host?.id==='case'){
   const gallery=document.getElementById('gallery'),shift=gallery?Math.max(0,gallery.scrollTop-gallery.clientHeight):-host.getBoundingClientRect().top;canvas.style.transform='translate3d(0,'+shift+'px,0)';
  }else canvas.style.transform='none';
 }
 function placeField(){
  const gallery=document.getElementById('gallery'),inGallery=gallery&&!gallery.hidden;
  const inContent=inGallery&&gallery.classList.contains('reading')&&gallery.scrollTop>=gallery.clientHeight;
  const host=inGallery?(inContent?document.getElementById('case'):document.getElementById('track')):document.querySelector('.project-map')||document.querySelector('main')||document.body;
  if(canvas.parentElement!==host)host.append(canvas);positionField();
 }
 function resize(){w=innerWidth;h=innerHeight;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.style.width=w+'px';canvas.style.height=h+'px';canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx?.setTransform(dpr,0,0,dpr,0,0);wake(.1);}
 function actionFor(target){
  const button=target.closest?.('button,a[href]');
  if(button){if(button.disabled)return null;return{node:button,text:button.id==='name-link'?'Sobre mim':button.classList.contains('card')?'Abrir projeto':button.textContent.trim()};}
  const gallery=document.getElementById('gallery');
  if(target.closest?.('#gallery-stage')&&!gallery.classList.contains('reading'))return{node:document.getElementById('gallery-stage'),text:'Conhecer o projeto'};
  if(target.closest?.('#overview'))return{node:document.getElementById('overview'),text:'Explorar projetos'};
  return null;
 }
 function setHover(action){
  const next=action?.node||null;if(next===hover){label.textContent=action?.text||'';return;}
  hover?.classList.remove('is-resonating');hover=next;
  if(hover?.matches('.card,#name-link'))hover.classList.add('is-resonating');
  cursor.classList.toggle('action',!!action);label.textContent=action?.text||'';wake(.18);
 }
 function wake(amount){energy=Math.min(1,energy+amount);if(!frame&&!document.hidden)frame=requestAnimationFrame(draw);}
 function draw(time){
  frame=0;if(document.hidden)return;
  if(time-last<32&&!motion.matches){frame=requestAnimationFrame(draw);return;}last=time;
  px=motion.matches?x:px+(x-px)*.065;py=motion.matches?y:py+(y-py)*.065;modulation+=(energy-modulation)*.075;placeField();
  cursor.style.transform='translate3d('+Math.min(w-190,Math.max(0,px+15))+'px,'+Math.min(h-42,Math.max(0,py+16))+'px,0)';
  const paths=[];if(ctx){ctx.clearRect(0,0,w,h);const phase=motion.matches?0:time*.0008,amplitude=12+modulation*48,inCover=canvas.parentElement?.id==='track';
   for(let wave=0;wave<3;wave++){ctx.beginPath();ctx.lineWidth=1.05+modulation*.35;const alpha=(.18+modulation*.43)*(1-wave*.16);ctx.strokeStyle=inCover?'rgba(65,43,114,'+alpha+')':'rgba(114,81,171,'+alpha+')';const sourceX=-48;let path='';
    for(let step=0;step<=72;step++){const t=step/72,envelope=Math.sin(t*Math.PI),anchor=t*t,sx=sourceX+(x-sourceX)*t;const carrier=Math.sin(t*Math.PI*(3+wave*.5+modulation)-phase+wave*.7),beat=Math.sin(t*Math.PI*7+phase*.7)*modulation*.35;const sy=py+(y-py)*anchor+(carrier+beat)*amplitude*envelope+(wave-1)*9*envelope;path+=(step?' L':'M')+sx.toFixed(2)+' '+sy.toFixed(2);if(!step)ctx.moveTo(sx,sy);else ctx.lineTo(sx,sy);}paths.push(path);ctx.stroke();
   }
  }
  if(window.dispatchEvent&&typeof CustomEvent==='function')window.dispatchEvent(new CustomEvent('pedro:wind',{detail:{paths,x,y,pointer}}));
  sound?.modulate(modulation,x/Math.max(1,w));
  energy*=.94;
  if(!motion.matches&&(energy>.006||modulation>.006||Math.abs(x-px)+Math.abs(y-py)>1))frame=requestAnimationFrame(draw);
  else if(ctx&&!motion.matches){ctx.clearRect(0,0,w,h);sound?.modulate(0,x/Math.max(1,w));}
 }
 document.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const speed=Math.hypot(e.clientX-x,e.clientY-y);x=e.clientX;y=e.clientY;pointer=true;cursor.classList.add('visible');setHover(actionFor(e.target));wake(Math.min(.18,speed*.002));},{passive:true});
 document.addEventListener('pointerout',e=>{if(!e.relatedTarget){pointer=false;cursor.classList.remove('visible');setHover(null);}},{passive:true});
 document.addEventListener('focusin',e=>{const action=actionFor(e.target);if(action){setHover(action);wake(.2);}});
 document.addEventListener('focusout',()=>{if(!pointer)setHover(null);});
 document.addEventListener('wheel',e=>wake(Math.min(.4,Math.abs(e.deltaY)*.0015)),{passive:true});
 document.addEventListener('scroll',()=>wake(.06),{passive:true,capture:true});
 document.addEventListener('pointerdown',e=>{if(e.target.closest?.('.sound-dock'))return;if(actionFor(e.target))wake(.5);},{passive:true});
 document.addEventListener('touchmove',e=>{if(e.touches[0]){x=e.touches[0].clientX;y=e.touches[0].clientY;wake(.08);}},{passive:true});
 toggle.addEventListener('click',async e=>{
  e.stopPropagation();if(busy)return;busy=true;toggle.setAttribute('aria-busy','true');document.getElementById('sound-label').textContent='Sintonizando áudio…';
  try{
   if(!sound){
    const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error('unsupported');
    context=new Audio();await context.resume();
    const module=await (window.PedroLoading?window.PedroLoading.run(()=>import('./audio.js'),{label:'Sintonizando áudio…'}):import('./audio.js'));sound=module.createSonicWind(context);
   }
   soundOn=!soundOn;await sound.setEnabled(soundOn);sound.setScene(location.hash.startsWith('#projeto/'));toggle.setAttribute('aria-pressed',String(soundOn));toggle.setAttribute('aria-label',soundOn?'Silenciar vento sonoro':'Ativar vento sonoro');document.getElementById('sound-label').textContent=soundOn?'Som: ligado':'Som: desligado';wake(.3);
  }catch{soundOn=false;if(context&&!sound)await context.close().catch(()=>{});toggle.setAttribute('aria-pressed','false');document.getElementById('sound-label').textContent='Som indisponivel';toggle.setAttribute('aria-label','Tentar ativar o som novamente');}
  finally{busy=false;toggle.setAttribute('aria-busy','false');}
 });
 let pagePresent=!document.hidden&&(document.hasFocus?.()??true);
 function syncPresence(present){pagePresent=present&&!document.hidden;if(!pagePresent){if(frame)cancelAnimationFrame(frame);frame=0;ctx?.clearRect(0,0,w,h);}else wake(.08);sound?.setScene(location.hash.startsWith('#projeto/'));sound?.setEnabled(soundOn&&pagePresent).catch(()=>{});const status=document.getElementById('sound-label');if(status)status.textContent=soundOn?(pagePresent?'Som: ligado':'Som: pausado'):'Som: desligado';}
 document.addEventListener('visibilitychange',()=>syncPresence(!document.hidden&&(document.hasFocus?.()??true)));window.addEventListener('blur',()=>syncPresence(false));window.addEventListener('focus',()=>syncPresence(true));window.addEventListener('pagehide',()=>syncPresence(false));window.addEventListener('pageshow',()=>syncPresence(!document.hidden));
 window.addEventListener('hashchange',()=>{placeField();setHover(null);sound?.setScene(location.hash.startsWith('#projeto/'));wake(.25);});
 document.addEventListener('click',e=>{if(e.target.closest?.('.sound-dock')||!actionFor(e.target))return;sound?.playClick(location.hash.startsWith('#projeto/')?'enter':'tap');});
 window.addEventListener('pedro:loading',()=>{if(soundOn&&pagePresent)sound?.playClick('tap');});
 window.addEventListener('resize',resize,{passive:true});placeField();resize();
})();
