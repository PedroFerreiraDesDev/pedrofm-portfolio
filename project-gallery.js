/* Uma distância finita: scroll para baixo avança; para cima refaz o percurso. */
(()=>{
 const gallery=document.getElementById('gallery');if(!gallery)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=x=>Math.max(0,Math.min(1,x));
 let dispose=()=>{},dialog;
 function zoom(photo){
  if(!photo)return;
  const box=photo.getBoundingClientRect();
  const ratio=Math.min(1.4,innerWidth*.82/Math.max(box.width,1),innerHeight*.68/Math.max(box.height,1));
  if(!dialog){
   dialog=document.createElement('dialog');dialog.className='project-image-zoom';dialog.setAttribute('aria-label','Imagem ampliada');
   dialog.innerHTML='<button type="button">Fechar imagem ×</button><img alt="">';document.body.append(dialog);
   dialog.querySelector('button').onclick=()=>dialog.close();
   dialog.addEventListener('keydown',event=>event.stopPropagation());
   dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  }
  const image=dialog.querySelector('img');image.src=photo.currentSrc||photo.src;image.alt=photo.alt;
  image.style.width=Math.max(1,box.width*ratio)+'px';image.style.height=Math.max(1,box.height*ratio)+'px';
  if(!dialog.open)dialog.showModal();
 }
 function mount(){
  dispose();dialog?.close();
  const root=document.querySelector('#case'),scene=root?.querySelector('.project-visual-index');
  if(!scene)return;
  const abort=new AbortController(),signal=abort.signal;
  const rail=scene.querySelector('.project-gallery-rail'),cards=[...rail.querySelectorAll('.project-gallery-card')];
  let frame=0,distance=0,start=0,travel=1;
  const flat=()=>reduced.matches||innerHeight<=500;
  function draw(){
   frame=0;if(document.hidden)return;
   if(flat()){rail.style.transform='none';cards.forEach(card=>card.style.transform='none');return;}
   const p=clamp((gallery.scrollTop-start)/travel),width=gallery.clientWidth,height=gallery.clientHeight;
   rail.style.transform='translate3d('+(-distance*p)+'px,0,0)';
   cards.forEach((card,i)=>{
    const center=card.offsetLeft+card.offsetWidth/2-distance*p;
    const relative=(center-width/2)/width,focus=1-clamp(Math.abs(relative)*1.6);
    const scale=.82+focus*.18,offset=parseFloat(card.style.getPropertyValue('--piece-offset'))||0;
    card.style.transform='translate3d(0,'+(Math.sin(p*Math.PI*2+i)*12+offset*height/100)+'px,0) rotate('+Math.max(-5,Math.min(5,relative*6))+'deg) scale('+scale+')';
   });
   scene.style.setProperty('--end-opacity',String(clamp((p-.87)/.13)));
  }
  function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(draw);}
  function measure(){
   distance=Math.max(0,rail.scrollWidth-gallery.clientWidth);
   travel=distance+gallery.clientHeight*.25;
   scene.style.setProperty('--gallery-height',flat()?'auto':(gallery.clientHeight+travel)+'px');
   start=gallery.scrollTop+scene.getBoundingClientRect().top-gallery.getBoundingClientRect().top;
   schedule();
  }
  scene.querySelector('[data-gallery-skip]').addEventListener('click',event=>{
   event.preventDefault();const next=scene.nextElementSibling;if(!next)return;
   gallery.scrollTo({top:gallery.scrollTop+next.getBoundingClientRect().top-gallery.getBoundingClientRect().top-24,behavior:reduced.matches?'auto':'smooth'});
   next.focus({preventScroll:true});
  },{signal});
  rail.addEventListener('focusin',event=>{
   const card=event.target.closest('.project-gallery-card');if(!card||flat()||!card.matches(':focus-visible'))return;
   scene.querySelector('.project-gallery-window').scrollLeft=0;
   // O foco por teclado traz também as peças fora da tela para o centro.
   const p=clamp((card.offsetLeft+card.offsetWidth/2-gallery.clientWidth/2)/Math.max(1,distance));
   gallery.scrollTo({top:start+p*travel,behavior:'instant'});
  },{signal});
  root.querySelectorAll('.flow-picture,.sequence-image').forEach(figure=>{
   figure.dataset.projectZoom='';figure.tabIndex=0;figure.setAttribute('role','button');
   figure.setAttribute('aria-label','Ampliar imagem: '+(figure.querySelector('img')?.alt||'Projeto'));
  });
  root.addEventListener('click',event=>{
   const target=event.target.closest('.project-gallery-card,[data-project-zoom]');if(target)zoom(target.querySelector('img'));
  },{signal});
  root.addEventListener('keydown',event=>{
   const target=event.target.closest('[data-project-zoom]');
   if(target&&['Enter',' '].includes(event.key)){event.preventDefault();zoom(target.querySelector('img'));}
  },{signal});
  gallery.addEventListener('scroll',schedule,{passive:true,signal});
  window.addEventListener('resize',measure,{passive:true,signal});
  root.addEventListener('load',measure,{capture:true,signal});
  reduced.addEventListener('change',measure,{signal});
  document.addEventListener('visibilitychange',schedule,{signal});
  const observer=typeof ResizeObserver==='function'?new ResizeObserver(measure):null;observer?.observe(rail);
  dispose=()=>{abort.abort();observer?.disconnect();cancelAnimationFrame(frame);};
  measure();
 }
 window.addEventListener('hashchange',mount);mount();
})();
