/* O hover recebe exatamente as curvas do rastro: uma trajetória, duas cores. */
(()=>{
 document.querySelectorAll('.map-node > .card').forEach(card=>{const surface=document.createElement('div');surface.className='tilt-surface';card.replaceWith(surface);surface.append(card);});
 let active=null,kind='';
 function reset(){if(active){active.classList.remove('ink-active','wind-image-active');active.style.removeProperty('--ink-field');active.style.removeProperty('--image-wind-mask');}active=null;kind='';}
 function targetAt(x,y){
  const target=document.elementFromPoint(x,y);if(!target)return null;
  if(target.closest('.wind-sequence,.experience-flow'))return null;
   const text=target.closest('.cover-word,#name-link,#project-title,#category,#name-intro p,#name-intro>span,#case h1,#case h2,#case p');
  if(text)return {node:text,kind:'text'};
  const image=target.closest('.story-visual');if(image)return {node:image,kind:'image'};
  const cover=target.closest('.card,.slide')?.querySelector('.cover-word');
  return cover?{node:cover,kind:'text'}:null;
 }
 function paint(event){
  const wind=event.detail;if(document.hidden||!wind.pointer){reset();return;}
  const hit=targetAt(wind.x,wind.y);if(!hit){reset();return;}
  if(hit.node!==active){reset();active=hit.node;kind=hit.kind;if(kind==='text'&&!active.querySelector('.wind-text-tint')){const overlay=document.createElement('span');overlay.className='wind-text-tint';overlay.setAttribute('aria-hidden','true');overlay.innerHTML=active.innerHTML;active.append(overlay);}else if(kind==='image'&&!active.querySelector('.wind-image-tint')){const overlay=document.createElement('span');overlay.className='wind-image-tint';overlay.setAttribute('aria-hidden','true');active.append(overlay);}}
  const rect=active.getBoundingClientRect();if(!rect.width||!rect.height)return;
  const paths=wind.paths.map((d,i)=>'<path d="'+d+'" fill="none" stroke="'+'white'+'" stroke-width="'+(i===0?24:i===1?12:6)+'" stroke-linecap="round"/>').join('');
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+Math.ceil(rect.width)+'" height="'+Math.ceil(rect.height)+'" viewBox="0 0 '+rect.width+' '+rect.height+'">'+'<g transform="translate('+(-rect.left)+' '+(-rect.top)+')">'+paths+'</g></svg>';
  const url='url("data:image/svg+xml,'+encodeURIComponent(svg)+'")';
  active.style.setProperty(kind==='text'?'--ink-field':'--image-wind-mask',url);
  active.classList.add(kind==='text'?'ink-active':'wind-image-active');
 }
 window.addEventListener('pedro:wind',paint);
 window.addEventListener('hashchange',reset);
 window.addEventListener('blur',reset);
 document.addEventListener('pointerout',e=>{if(!e.relatedTarget)reset();},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
})();
