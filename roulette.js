/* Estudo em roleta: uma folha por etapa, sem rolagem vertical da página. */
(()=>{
 const gallery=document.getElementById('gallery'),details=document.getElementById('case'),motion=matchMedia('(prefers-reduced-motion: reduce)');
 if(!gallery||!details)return;
 let panels=[],current=0,busy=false,timer=0,wheelTotal=0,lastWheel=0,startX=0,startY=0,controls=null;
 function back(){location.hash=location.hash.replace('#projeto/','#galeria/');}
 function show(next,direction=1){
  if(next<0){back();return;}if(next>=panels.length||busy)return;
  const outgoing=panels[current],incoming=panels[next];current=next;busy=true;
  outgoing?.getAnimations().forEach(a=>a.cancel());incoming.getAnimations().forEach(a=>a.cancel());
  panels.forEach((p,i)=>{p.hidden=i!==current;p.inert=i!==current;});
  incoming.scrollTop=0;
  if(!motion.matches)incoming.animate([{transform:'translate3d('+direction*22+'%,12%,0) rotateY('+direction*28+'deg) rotateZ('+direction*4+'deg)',opacity:.65},{transform:'none',opacity:1}],{duration:850,easing:'cubic-bezier(.16,.8,.2,1)'});
  controls.querySelector('[data-panel-count]').textContent=String(current+1).padStart(2,'0')+' / '+String(panels.length).padStart(2,'0');
  controls.querySelector('[data-panel-next]').disabled=current===panels.length-1;
  panels.forEach((p,i)=>p.setAttribute('aria-label','Etapa '+(i+1)+' de '+panels.length));
  incoming.focus({preventScroll:true});
  clearTimeout(timer);timer=setTimeout(()=>{busy=false;},motion.matches?0:850);
 }
 function step(dir){if(!busy)show(current+dir,dir);}
 function setup(){
  clearTimeout(timer);busy=false;wheelTotal=0;details.classList.remove('roulette');panels=[];controls=null;
  if(details.hidden)return;
  const inner=details.querySelector('.detail-inner');if(!inner)return;
  details.classList.add('roulette');gallery.scrollTop=0;
  const nodes=[...inner.children],intro=document.createElement('section');intro.className='roulette-panel roulette-intro';
  panels.push(intro);let passedIntro=false;
  nodes.forEach(node=>{
   if(!passedIntro&&!node.matches('section,figure,button,a')){intro.append(node);return;}
   passedIntro=true;
   if(node.matches('button,a')){panels.at(-1).append(node);return;}
   const panel=document.createElement('section');panel.className='roulette-panel';panel.append(node);panels.push(panel);
  });
  inner.replaceChildren(...panels);panels.forEach(p=>{p.tabIndex=-1;p.setAttribute('role','group');});
  controls=document.createElement('nav');controls.className='roulette-controls';controls.setAttribute('aria-label','Etapas do estudo');
  controls.innerHTML='<button data-panel-back>Voltar à capa</button><div><button data-panel-prev aria-label="Etapa anterior">←</button><span data-panel-count aria-live="polite"></span><button data-panel-next aria-label="Próxima etapa">→</button></div><small>Role para girar as folhas</small>';
  details.append(controls);controls.querySelector('[data-panel-back]').onclick=back;controls.querySelector('[data-panel-prev]').onclick=()=>step(-1);controls.querySelector('[data-panel-next]').onclick=()=>step(1);
  details.querySelectorAll('[data-close]').forEach(b=>b.onclick=back);
  current=0;show(0);
 }
 gallery.addEventListener('wheel',e=>{
  if(details.hidden||!details.classList.contains('roulette')||e.ctrlKey)return;
  const panel=panels[current],delta=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);
  // Uma folha longa continua legível em telas pequenas antes da próxima etapa.
  if(panel.scrollHeight>panel.clientHeight+2&&((delta>0&&panel.scrollTop+panel.clientHeight<panel.scrollHeight-2)||(delta<0&&panel.scrollTop>2)))return;
  e.preventDefault();
  const now=performance.now();if(now-lastWheel>180)wheelTotal=0;lastWheel=now;
  if(busy){wheelTotal=0;return;}
  wheelTotal+=delta;if(Math.abs(wheelTotal)>=55){step(Math.sign(wheelTotal));wheelTotal=0;}
 },{passive:false});
 gallery.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;startY=e.touches[0].clientY;},{passive:true});
 gallery.addEventListener('touchend',e=>{
  if(details.hidden||e.target.closest('button,a'))return;
  const dx=startX-e.changedTouches[0].clientX,dy=startY-e.changedTouches[0].clientY;
  if(panels[current]?.scrollHeight>panels[current]?.clientHeight+2&&Math.abs(dy)>Math.abs(dx))return;
  const delta=Math.abs(dx)>Math.abs(dy)?dx:dy;if(Math.abs(delta)>55)step(Math.sign(delta));
 },{passive:true});
 document.addEventListener('keydown',e=>{
  if(details.hidden||!details.classList.contains('roulette')||e.altKey||e.ctrlKey||e.metaKey)return;
  if(['ArrowRight','ArrowDown','PageDown','ArrowLeft','ArrowUp','PageUp','Home','End'].includes(e.key)){
   e.preventDefault();
   if(e.key==='Home')show(0,-1);else if(e.key==='End')show(panels.length-1);else step(['ArrowLeft','ArrowUp','PageUp'].includes(e.key)?-1:1);
  }
 });
 window.addEventListener('hashchange',setup);setup();
})();
