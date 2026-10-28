/* Intro, revelacao das capas e zoom em um unico ciclo RAF. */
(()=>{
 const map=document.getElementById('overview'),plane=document.getElementById('grid'),intro=document.getElementById('name-intro');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const buttons=[...plane.querySelectorAll('button')],nodes=[...plane.querySelectorAll('.map-node')];let accessible=false;
 function measureEntries(){
  nodes.forEach((node,i)=>{
   const edge=i%4,margin=Math.max(innerWidth,innerHeight)*.25;
   const x=edge===0?-(node.offsetLeft+node.offsetWidth+margin):edge===1?innerWidth-node.offsetLeft+margin:0;
   const y=edge===2?-(node.offsetTop+node.offsetHeight+margin):edge===3?innerHeight-node.offsetTop+margin:0;
   node.style.setProperty('--entry-x',x+'px');node.style.setProperty('--entry-y',y+'px');
  });
 }
 measureEntries();
 let value=0,target=0,frame=0,lastTime=0,settle=null,settleAllowed=true,lastWheelAt=0,lastWheelDelta=0;
 const settleThreshold=1.8,settleDuration=420;const handoff=2;let cover=null,coverWord=null,sourceCard=null,geometry=null;

 function clearCover(){cover?.remove();cover=coverWord=geometry=null;if(sourceCard)sourceCard.style.visibility='';sourceCard=null;document.body.classList.remove('zoom-expanding');}
 function expandCover(progress){
  if(progress<=0){clearCover();intro.style.opacity='1';return;}
  if(!cover){
   sourceCard=buttons[0];const template=sourceCard?document.querySelector('#track .slide:nth-child(2)'):null;
   if(!sourceCard||!template)return;
   document.body.classList.add('zoom-expanding');
   const sourceWord=sourceCard.querySelector('.cover-word'),rect=sourceCard.getBoundingClientRect(),wordRect=sourceWord.getBoundingClientRect();
   cover=template.cloneNode(true);cover.classList.add('zoom-cover');cover.setAttribute('aria-hidden','true');map.append(cover);coverWord=cover.querySelector('.cover-word');
   const cue=document.createElement('span');cue.className='zoom-handoff-cue';cue.textContent='Continue rolando para percorrer os projetos →';cover.append(cue);
   const destination=coverWord.getBoundingClientRect(),startFont=parseFloat(getComputedStyle(sourceWord).fontSize),endFont=parseFloat(getComputedStyle(coverWord).fontSize);
   geometry={rect,dx:wordRect.left-destination.left,dy:wordRect.top-destination.top,scale:startFont/endFont};
   sourceCard.style.visibility='hidden';
  }
  const t=progress*progress*(3-2*progress),rest=1-t,r=geometry.rect;
  cover.style.clipPath='inset('+(Math.max(0,r.top)*rest)+'px '+(Math.max(0,innerWidth-r.right)*rest)+'px '+(Math.max(0,innerHeight-r.bottom)*rest)+'px '+(Math.max(0,r.left)*rest)+'px)';
  coverWord.style.transform='translate3d('+(geometry.dx*rest)+'px,'+(geometry.dy*rest)+'px,0) scale('+(geometry.scale+(1-geometry.scale)*t)+')';
  cover.style.setProperty('--handoff-progress',Math.max(0,Math.min(1,(progress-.65)/.25)));
  const slot=cover.querySelector('.slot');if(slot)slot.style.opacity=String(t);
  plane.style.opacity=String(rest);intro.style.opacity=String(rest);
 }
 function draw(time){
  frame=0;const dt=typeof time==='number'?Math.min(40,lastTime?time-lastTime:16.67):16.67;if(typeof time==='number')lastTime=time;
  if(!document.body.classList.contains('map-mode')){settle=null;return;}
  const follow=1-Math.exp(-dt/200);
  if(settle){
   settle.elapsed+=dt;const t=Math.min(1,settle.elapsed/settleDuration);
   value=settle.from+(handoff-settle.from)*(1-Math.pow(1-t,3));
   if(t===1){value=target=handoff;settle=null;}
  }else{
   value=motion.matches?target:value+(target-value)*follow;
   if(Math.abs(value-target)<.001)value=target;
   if(settleAllowed&&value>=settleThreshold&&target>=settleThreshold){
    if(motion.matches)value=target=handoff;
    else{settle={from:value,elapsed:0};target=handoff;}
   }
  }
  const progress=Math.min(1,value),outside=1-progress,scale=.82+.18*progress;
  plane.style.transform='scale('+scale+')';plane.style.setProperty('--outside',outside);plane.style.opacity=String(Math.min(1,progress/.18));
  nodes.forEach((node,i)=>{
   const delay=(i%4)*.035,p=Math.max(0,Math.min(1,(progress-delay)/(1-delay))),arrival=p*p*(3-2*p);
   node.style.setProperty('--outside',1-arrival);node.style.opacity=String(Math.min(1,p/.28));
  });
  intro.style.transform='translate3d(0,'+(-progress*40)+'dvh,0) scale('+(1-progress*.68)+')';
  intro.style.setProperty('--phrase-opacity',1-progress);
  plane.style.pointerEvents=progress>.12?'auto':'none';
  if(accessible!==(progress>.12)||value===0){accessible=progress>.12;buttons.forEach(b=>{b.tabIndex=accessible?0:-1;});}
  plane.setAttribute('aria-hidden',String(progress<=.05));
  expandCover(Math.max(0,Math.min(1,value-1)));
  if(value>=handoff&&document.body.classList.contains('map-mode')){expandCover(1);document.body.classList.add('zoom-arrival');value=target=1;enterGalleryFromZoom({at:lastWheelAt,delta:lastWheelDelta});return;}
  if(value!==target||settle)frame=requestAnimationFrame(draw);
 }
 function set(next){
  const delta=next-target;
  if(delta<0)settleAllowed=false;else if(delta>0)settleAllowed=true;
  if(settle){if(delta>=0)return;settle=null;next=value+delta;}
  target=Math.max(0,Math.min(handoff,next));if(!frame){lastTime=0;frame=requestAnimationFrame(draw);}}
 map.addEventListener('wheel',e=>{if(e.ctrlKey||!document.body.classList.contains('map-mode'))return;e.preventDefault();const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);lastWheelAt=Date.now();lastWheelDelta=delta;set(target+Math.max(-180,Math.min(180,delta))*.00135);},{passive:false});
 document.addEventListener('keydown',e=>{if(!document.body.classList.contains('map-mode'))return;if(['ArrowDown','PageDown','+','='].includes(e.key)){e.preventDefault();set(target+.2);}if(['ArrowUp','PageUp','-'].includes(e.key)){e.preventDefault();set(target-.2);}if(e.key==='Home'||e.key==='0'){e.preventDefault();set(0);}});
 let startY=0,pinchStart=0,pinchBase=0;
 const distance=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
 map.addEventListener('touchstart',e=>{startY=e.touches[0].clientY;if(e.touches.length===2){pinchStart=distance(e.touches);pinchBase=target;}},{passive:true});
 map.addEventListener('touchmove',e=>{e.preventDefault();if(e.touches.length===2&&pinchStart)set(pinchBase+(distance(e.touches)/pinchStart-1));else{const y=e.touches[0].clientY;set(target+(startY-y)*.003);startY=y;}},{passive:false});
 map.addEventListener('touchend',()=>pinchStart=0,{passive:true});
 window.addEventListener('hashchange',()=>{settle=null;if(frame)cancelAnimationFrame(frame);frame=0;target=value;requestAnimationFrame(()=>{clearCover();document.body.classList.remove('zoom-arrival');if(document.body.classList.contains('map-mode'))draw();});});
 window.addEventListener('resize',()=>{measureEntries();clearCover();if(document.body.classList.contains('map-mode')&&!frame)frame=requestAnimationFrame(draw);},{passive:true});
 draw();
})();
