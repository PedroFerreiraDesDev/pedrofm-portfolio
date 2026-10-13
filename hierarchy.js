/* Dica apenas sobre a capa; ação principal continua disponível para toque e teclado. */
(()=>{
 const stage=document.getElementById('gallery-stage');if(!stage)return;
 const hint=document.createElement('span');hint.id='cover-pointer-hint';hint.textContent='Clique para conhecer';hint.setAttribute('aria-hidden','true');document.body.append(hint);
 let frame=0,x=0,y=0;
 const hide=()=>{hint.classList.remove('visible');cancelAnimationFrame(frame);frame=0;};
 stage.addEventListener('pointermove',event=>{
  if(event.pointerType==='touch'||!location.hash.startsWith('#galeria/')||event.target.closest('button,a')||!event.target.closest('.slide,#project-title')){hide();return;}
  x=Math.max(8,Math.min(innerWidth-160,event.clientX+18));y=Math.max(8,Math.min(innerHeight-40,event.clientY+20));
  hint.classList.add('visible');
  if(!frame)frame=requestAnimationFrame(()=>{hint.style.transform='translate3d('+x+'px,'+y+'px,0)';frame=0;});
 },{passive:true});
 stage.addEventListener('pointerleave',hide);
 document.getElementById('gallery').addEventListener('scroll',hide,{passive:true});
 window.addEventListener('blur',hide);
 window.addEventListener('hashchange',()=>{
  hide();if(!location.hash.startsWith('#galeria/')||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const wave=stage.querySelector('.gallery-scroll-cue svg');
  wave?.getAnimations?.().forEach(animation=>animation.cancel());
  wave?.animate?.([{transform:'translateY(0) scaleX(1)'},{transform:'translateY(-5px) scaleX(1.45)'},{transform:'translateY(3px) scaleX(.8)'},{transform:'translateY(0) scaleX(1)'}],{duration:750,easing:'ease-in-out'});
 });
})();
