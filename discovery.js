/* Descoberta: dados JSON sob demanda, transformações 3D e um RAF apenas enquanto visível. */
(()=>{
 const motion=matchMedia('(prefers-reduced-motion: reduce)'),gallery=document.getElementById('gallery');let current=null,configuration=null;
 function load(){if(!configuration){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);configuration=fetch('interacoes.json',{signal:controller.signal}).then(response=>{if(!response.ok)throw Error();return response.json();}).then(data=>{if(data.version!==1)throw Error('Versão inválida');return data;}).catch(error=>{configuration=null;throw error;}).finally(()=>clearTimeout(timer));}return configuration;}
 const bounded=(value,fallback,min,max)=>Number.isFinite(Number(value))?Math.max(min,Math.min(max,Number(value))):fallback;
 function mount(){current?.destroy();current=null;const lab=document.querySelector('.discovery-lab');if(!lab)return;
  const stage=lab.querySelector('.discovery-stage'),deck=lab.querySelector('.discovery-deck'),bands=[...lab.querySelectorAll('.discovery-band')],back=lab.querySelector('.discovery-back'),middle=lab.querySelector('.discovery-middle'),range=lab.querySelector('input'),canvas=lab.querySelector('canvas'),ctx=canvas.getContext('2d'),buttons=[...lab.querySelectorAll('[data-variant]')],note=lab.querySelector('.discovery-note');
  const events=new AbortController();let touched=false;let observer=null,alive=true,visible=false,loaded=false,frame=0,x=0,y=0,px=0,py=0,heat=0,width=1,height=1,variant='layers',amplitude=30,depth=90,frequency=3;
  const notes={layers:'Camadas: a superfície se abre e deixa as escolhas aparecerem.',resonance:'Ressonância: as faixas se deslocam como uma onda; a composição se transforma.',journey:'Percurso: a rolagem afasta as folhas e muda seu ponto de vista.'};
  function choose(next){variant=notes[next]?next:'layers';lab.dataset.variant=variant;buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.variant===variant)));note.textContent=notes[variant];heat=1;schedule();}
  function resize(){const rect=stage.getBoundingClientRect();width=rect.width||1;height=rect.height||1;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx?.setTransform(dpr,0,0,dpr,0,0);schedule();}
  function draw(){frame=0;if(!alive||!visible||document.hidden)return;
   const rect=stage.getBoundingClientRect(),scroll=Math.max(0,Math.min(1,(innerHeight*.75-rect.top)/(innerHeight*.8))),intensity=Number(range.value)/100;
   px+= (x-px)*.12;py+=(y-py)*.12;heat*=.9;const active=motion.matches?0:intensity,spread=variant==='layers'?.3+active*.85+Math.abs(px)*active*.5:variant==='journey'?scroll*active:active*.3;
   const rotationX=motion.matches?0:-py*9,rotationY=motion.matches?0:px*15;
   deck.style.transform='rotateX('+rotationX+'deg) rotateY('+rotationY+'deg)';
   back.style.transform=motion.matches?'none':'translate3d('+(-spread*90)+'px,'+(-spread*48)+'px,'+(-depth*spread)+'px) rotate('+(-spread*8)+'deg)';
   middle.style.transform=motion.matches?'none':'translate3d('+(spread*95)+'px,'+(spread*42)+'px,'+(-depth*.5*spread)+'px) rotate('+(spread*7)+'deg)';
   bands.forEach((band,i)=>{const phase=i*.7+px*frequency+scroll*2,amount=variant==='resonance'?active*amplitude:active*amplitude*.16;band.style.transform=motion.matches?'none':'translate3d(0,'+(Math.sin(phase)*amount)+'px,'+(Math.cos(phase)*amount*.7)+'px) rotateX('+(Math.sin(phase)*amount*.16)+'deg)';});
   if(ctx){ctx.clearRect(0,0,width,height);for(let wave=0;wave<3;wave++){ctx.beginPath();ctx.strokeStyle=wave===0?'rgba(114,81,171,.48)':'rgba(36,106,142,.25)';ctx.lineWidth=1.2;for(let i=0;i<=90;i++){const t=i/90,xx=t*width,yy=height*.5+Math.sin(t*Math.PI*frequency+px*2+wave*.6)*Math.sin(t*Math.PI)*(16+intensity*amplitude+heat*12)+(wave-1)*10+py*25;if(i)ctx.lineTo(xx,yy);else ctx.moveTo(xx,yy);}ctx.stroke();}}
   if(!motion.matches&&(Math.abs(x-px)+Math.abs(y-py)>.003||heat>.01))schedule();
  }
  function schedule(){if(alive&&visible&&!document.hidden&&!frame)frame=requestAnimationFrame(draw);}
  async function initialize(){if(loaded||!alive)return;loaded=true;const wait=window.PedroLoading?.begin({scope:stage,label:'Sintonizando camadas…',retry:()=>{loaded=false;initialize();}});try{const data=await load();if(!alive||!lab.isConnected){wait?.done();return;}const settings={...data.defaults,...data.projects?.[lab.dataset.project]};amplitude=bounded(settings.amplitude,30,0,60);depth=bounded(settings.depth,90,0,150);frequency=bounded(settings.frequency,3,1,8);wait?.done();if(!touched)choose(settings.variant);resize();}catch{if(alive)wait?.fail('Não foi possível carregar esta sintonia. Tente novamente.');else wait?.done();}}
  buttons.forEach(button=>button.addEventListener('click',()=>{touched=true;choose(button.dataset.variant);},{signal:events.signal}));range.addEventListener('input',()=>{heat=.6;schedule();},{signal:events.signal});
  stage.addEventListener('pointermove',event=>{if(event.pointerType==='touch'||motion.matches)return;const rect=stage.getBoundingClientRect();x=Math.max(-1,Math.min(1,(event.clientX-rect.left)/rect.width*2-1));y=Math.max(-1,Math.min(1,(event.clientY-rect.top)/rect.height*2-1));heat=.7;schedule();},{passive:true,signal:events.signal});
  stage.addEventListener('pointerleave',()=>{x=y=0;heat=.4;schedule();},{passive:true,signal:events.signal});
  gallery?.addEventListener('scroll',()=>schedule(),{passive:true,signal:events.signal});window.addEventListener('resize',resize,{passive:true,signal:events.signal});document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();},{signal:events.signal});motion.addEventListener('change',schedule,{signal:events.signal});
  resize();if('IntersectionObserver' in window){observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){initialize();schedule();}else{cancelAnimationFrame(frame);frame=0;}},{rootMargin:'100px'});observer.observe(stage);}else{visible=true;initialize();}
  current={destroy(){alive=false;events.abort();observer?.disconnect();cancelAnimationFrame(frame);}};
 }
 window.addEventListener('hashchange',mount);mount();
})();
