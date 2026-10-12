/* Folhas em movimento: o scroll conduz a capa e assenta o conteúdo lateralmente. */
(()=>{
 const gallery=document.getElementById('gallery'),details=document.getElementById('case'),track=document.getElementById('track'),motion=matchMedia('(prefers-reduced-motion: reduce)');
 if(!gallery||!details||!track)return;
 const plane=document.createElement('div');plane.id='paper-plane';track.replaceWith(plane);plane.append(track);
 let pointer=0,pointerTarget=0;
 let blocks=[],frame=0,entrance=null,passing=null,previousHome=gallery.hidden;
 const clamp=v=>Math.max(0,Math.min(1,v));
 function offset(node){let top=0;while(node&&node!==details){top+=node.offsetTop||0;node=node.offsetParent;}return top;}
 function measure(){blocks.forEach(item=>{const pair=item.node.closest?.('.story-pair');item.top=offset(pair&&innerWidth>760?pair:item.node);item.paired=!!pair;});}
 function draw(){
  frame=0;if(document.hidden||gallery.hidden)return;
  pointer+=(pointerTarget-pointer)*.12;
  const height=gallery.clientHeight||innerHeight,progress=clamp(gallery.scrollTop/height);
  plane.style.transform=motion.matches?'none':'translate3d('+(-progress*32)+'px,'+(-progress*height*.16)+'px,0) rotateX('+(-progress*12)+'deg) rotateZ('+(-progress*1.4)+'deg) scale('+(1-progress*.055)+')';
  if(details.hidden)return;
  const tuning=window.PedroResonance||{},resonance=tuning.enabled&&!motion.matches;
  const smallScreen=innerWidth<=760,strength=resonance?(tuning.intensity??.65)*(smallScreen?.45:1):0;
  blocks.forEach((item,i)=>{
   const top=height+item.top-gallery.scrollTop;
   const enter=clamp((height*.92-top)/(height*.6)),visual=item.node.classList.contains('story-visual');
   const flow=item.node.dataset?.flow,small=innerWidth<=760;
   // Uma referência de scroll por par; os dois blocos assentam antes da leitura.
   const p=clamp((enter-(visual?.055:0))/(visual?.945:1)),outside=1-p*p*(3-2*p);
   const direction=flow==='copy-left'?1:flow==='copy-right'||flow==='image-left'?-1:i%2?-1:1;
   const distance=small?Math.min(innerWidth*.065,28):item.paired?(visual?170:220):140;
   const shift=(flow==='image-rise'?small?0:52:distance)*direction;
   const rise=small?40:flow==='image-rise'?150:visual?110:65;
   // A mesma posição de scroll conduz entrada, onda e profundidade.
   // A envoltória cresce e recua suavemente; textos se deslocam menos.
   const travel=clamp((height-top)/(height+(item.node.offsetHeight||height*.5)));
   const envelope=Math.sin(travel*Math.PI)**2;
   const phase=gallery.scrollTop/height*(tuning.frequency||3)+i*.55+pointer*.4;
   const wave=Math.sin(phase)*envelope*strength;
   const sway=wave*(visual?20:7),lift=Math.cos(phase)*envelope*strength*(visual?16:3);
   item.bands?.forEach((band,index)=>{
    const a=(tuning.amplitude??30)*strength*envelope;
    const angle=phase+index*.68;
    band.style.transform=motion.matches?'none':'translate3d(0,'+(Math.sin(angle)*a)+'px,'+(Math.cos(angle)*a*(tuning.depth??90)/120)+'px) rotateX('+(Math.sin(angle)*a*.12)+'deg)';
   });
   item.node.style.transform=motion.matches?'none':'translate3d('+(shift*outside+sway)+'px,'+(rise*outside+lift)+'px,0) rotate('+((i%2?-1:1)*outside*(small?(visual?1.2:.4):(visual?4.5:1.2)))+'deg) scale('+(visual?1-outside*(small?.035:.09):1)+')';
   item.node.style.opacity=motion.matches?'1':String(1-outside*(visual?.7:.5));
   const image=visual&&!item.bands?.length?item.node.querySelector?.('img'):null;if(image)image.style.transform=motion.matches?'none':'translate3d(0,'+(-outside*(small?12:28))+'px,0) scale('+(1+outside*.14)+')';

  });
  if(resonance&&Math.abs(pointerTarget-pointer)>.003)schedule();
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(draw);}
 function setup(){
  blocks=details.querySelector?.('.experience-flow')?[]:[...details.querySelectorAll('.detail-inner > *:not(.story-pair):not(.discovery-lab):not(.wind-sequence), .story-pair:not(.sequence-followup) > *')].map(node=>{node.classList.add('story-block','is-seen');return{node,top:0,bands:[...(node.querySelectorAll?.('.resonance-band')||[])]};});
  details.querySelectorAll('.resonance-surface').forEach(surface=>{
   const images=[...surface.querySelectorAll('img')];
   const ready=()=>{if(images.every(img=>img.complete&&img.naturalWidth>0))surface.classList.add('is-ready');};
   images.forEach(img=>img.addEventListener('load',ready,{once:true}));ready();
  });
  measure();schedule();
  if(previousHome&&!gallery.hidden&&!motion.matches&&!document.body.classList.contains('zoom-arrival')){
   entrance?.cancel();entrance=plane.animate([{transform:'translate3d(-12vw,26vh,0) rotateX(20deg) rotateZ(-7deg) scale(.86)'},{transform:'none'}],{duration:980,easing:'cubic-bezier(.16,.8,.2,1)'});
  }
  previousHome=gallery.hidden;
 }
 track.addEventListener('transitionrun',e=>{
  if(e.target!==track||e.propertyName!=='transform'||gallery.classList.contains('reading')||motion.matches)return;
  passing?.cancel();passing=plane.animate([{transform:'none'},{transform:'translate3d(0,-48px,0) rotateX(7deg) rotateZ(-1.3deg) scale(.97)',offset:.42},{transform:'none'}],{duration:980,easing:'cubic-bezier(.16,.8,.2,1)'});
 });
 function speed(card,rate){if(motion.matches)return;card.getAnimations?.().forEach(animation=>{if(animation.animationName==='wind'){if(animation.updatePlaybackRate)animation.updatePlaybackRate(rate);else animation.playbackRate=rate;}});}
 document.addEventListener('pointerover',e=>{const card=e.target.closest('.card');if(card&&!card.contains(e.relatedTarget))speed(card,2.1);},{passive:true});
 document.addEventListener('pointerout',e=>{const card=e.target.closest('.card');if(card&&!card.contains(e.relatedTarget))speed(card,1);},{passive:true});
 document.addEventListener('focusin',e=>{if(e.target.matches('.card'))speed(e.target,2.1);});
 document.addEventListener('focusout',e=>{if(e.target.matches('.card'))speed(e.target,1);});
 gallery.addEventListener('scroll',()=>{if(gallery.classList.contains('reading')){entrance?.cancel();passing?.cancel();}schedule();},{passive:true});
 window.addEventListener('resize',()=>{measure();schedule();},{passive:true});
 if('ResizeObserver' in window)new ResizeObserver(()=>{measure();schedule();}).observe(details);
 details.addEventListener('load',()=>{measure();schedule();},true);
 document.fonts?.ready.then(()=>{measure();schedule();});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
 window.addEventListener('hashchange',setup);
 window.addEventListener('resonancechange',schedule);
 details.addEventListener('pointermove',event=>{if(event.pointerType==='touch'||motion.matches)return;pointerTarget=event.clientX/innerWidth*2-1;schedule();},{passive:true});
 details.addEventListener('pointerleave',()=>{pointerTarget=0;schedule();},{passive:true});
 motion.addEventListener('change',()=>{entrance?.cancel();passing?.cancel();schedule();});
 setup();
})();
