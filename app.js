/* Navegação: o conteúdo é editado em conteudo.js. */
const projects=[...portfolioData.projects.filter(p=>!p.about),...portfolioData.projects.filter(p=>p.about)];
const $=id=>document.getElementById(id),grid=$('grid'),gallery=$('gallery'),track=$('track'),lens=$('lens'),details=$('case');
const word=p=>escapeContent(p.word).replaceAll('\n','<br>');
let current=0,mode='home',lastMove=0,detailsReady=false,wheelTotal=0,wheelStamp=0,wheelConsumed=false,lensFrame=0,lensPoint=null;
grid.innerHTML=projects.filter(p=>!p.about).map((p,i)=>'<div class="map-node" style="--entry-x:'+([-55,55,-55,55][i%4])+'vw;--entry-y:'+([-35,-35,35,35][i%4])+'vh"><button class="card" style="background:'+p.color+';color:#101010" data-index="'+i+'" aria-label="Abrir '+escapeContent(p.title)+'"><span class="card-face"><span class="n">0'+(i+1)+' / '+escapeContent(p.category)+'</span><strong class="cover-word">'+word(p)+'</strong><span class="card-bottom">PROVISÓRIO</span></span><span class="card-hover-tint" aria-hidden="true"></span><span class="card-summary">'+escapeContent(p.summary)+'</span></button></div>').join('');
track.innerHTML=[projects.at(-1),...projects,projects[0]].map(p=>'<div class="slide" style="background:'+p.color+';color:#101010"><span class="slot">'+(p.about?'PEDRO.FM / PERFIL EM CONSTRUÇÃO':'ESPAÇO PROVISÓRIO · CAPA PENDENTE')+'</span><strong class="cover-word">'+word(p)+'</strong></div>').join('');
function arrangeMap(){
 const nodes=[...grid.querySelectorAll('.map-node')];grid.classList.toggle('expanded-map',nodes.length>4);if(nodes.length<=4)return;
 const cols=innerWidth<=700?2:3,rows=Math.ceil(nodes.length/cols),step=68/rows;
 nodes.forEach((node,i)=>{node.style.setProperty('--tilt',(i%2?2:-3)+'deg');node.style.setProperty('--auto-left',(5+(i%cols)*90/cols)+'%');node.style.setProperty('--auto-top',(22+Math.floor(i/cols)*step)+'%');node.style.setProperty('--auto-width',(90/cols-3)+'%');node.style.setProperty('--auto-height',(step-3)+'dvh');node.style.setProperty('--auto-type','clamp(16px,'+Math.min(innerWidth<=700?2.6:4,step*.19)+'vh,56px)');});
}
window.addEventListener('resize',arrangeMap,{passive:true});arrangeMap();
function navigate(kind,index=current){location.hash=kind+'/'+projects[index].id;}
function hideLens(){lensPoint=null;if(lensFrame)cancelAnimationFrame(lensFrame);lensFrame=0;lens.hidden=true;$('process')?.setAttribute('aria-expanded','false');}
// Clones nas extremidades mantem o deslocamento no mesmo sentido ao fechar o loop.
let trackSlot=1,pendingMove=null,trackBusy=false,loopTimer=0;
function finishLoop(){
 clearTimeout(loopTimer);trackBusy=false;
 if(trackSlot===0||trackSlot===projects.length+1){
  trackSlot=current+1;track.style.transition='none';track.style.transform='translateX(-'+trackSlot*100+'%)';
  requestAnimationFrame(()=>requestAnimationFrame(()=>track.style.transition=''));
 }
}
track.addEventListener('transitionend',e=>{if(e.target===track&&e.propertyName==='transform')finishLoop();});
function renderGallery(){
 const p=projects[current],queued=pendingMove?.index===current?pendingMove:null;pendingMove=null;
 if(queued){trackSlot=queued.slot;track.style.transition=reducedMotion.matches?'none':'';track.style.transform='translateX(-'+trackSlot*100+'%)';if(reducedMotion.matches)finishLoop();else loopTimer=setTimeout(finishLoop,1100);}
 else{clearTimeout(loopTimer);trackBusy=false;trackSlot=current+1;track.style.transition='none';track.style.transform='translateX(-'+trackSlot*100+'%)';requestAnimationFrame(()=>track.style.transition='');}
 $('gallery-contact').href='#projeto/'+p.id+'/contato';
 $('counter').textContent='0'+(current+1)+' / 0'+projects.length;$('category').textContent=p.category;$('project-title').textContent=p.title;$('lens-title').textContent=p.lens;$('prev').disabled=false;$('next').disabled=false;hideLens();
}
function renderDetails(p){details.innerHTML=renderProjectContent(p);details.querySelector('[data-close]').onclick=()=>gallery.scrollTo({top:0,behavior:reducedMotion.matches?'auto':'smooth'});}
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
function route(){
 const parts=location.hash.slice(1).split('/'),index=projects.findIndex(p=>p.id===parts[1]);
 const next=index>=0&&['galeria','projeto'].includes(parts[0])?(parts[0]==='projeto'?'detail':'gallery'):'home';
 const wasHome=mode==='home',changed=index>=0&&index!==current,reuseDetails=mode==='detail'&&index===current;
 mode=next;gallery.hidden=mode==='home';$('overview').hidden=mode!=='home';document.body.classList.toggle('map-mode',mode==='home');
 document.body.style.overflow='hidden';document.documentElement.style.overflow='hidden';
 hideLens();
 if(mode==='home'){details.hidden=true;gallery.scrollTop=0;if(!wasHome)$('name-link').focus({preventScroll:true});}
 else{
  if(changed||wasHome)gallery.scrollTop=0;
  current=index;renderGallery();details.hidden=mode!=='detail';
  gallery.classList.toggle('reading',mode==='detail');$('more').setAttribute('aria-expanded',String(mode==='detail'));
  if(mode==='detail'){detailsReady=false;if(!reuseDetails)renderDetails(projects[current]);requestAnimationFrame(()=>{
   const contact=parts[2]==='contato'?details.querySelector('.project-contact'):null;
   const top=contact?gallery.scrollTop+contact.getBoundingClientRect().top-gallery.getBoundingClientRect().top-24:gallery.clientHeight;
   gallery.scrollTo({top,behavior:reducedMotion.matches?'auto':'smooth'});
   if(contact)contact.focus({preventScroll:true});
  });}
  else{gallery.scrollTop=0;$('all').focus({preventScroll:true});}
 }
 updateMotion();
}
function move(direction){if(mode!=='gallery'||trackBusy||!direction)return;const step=Math.sign(direction),next=(current+step+projects.length)%projects.length;pendingMove={index:next,slot:current+1+step};trackBusy=true;navigate('galeria',next);}
function enterGalleryFromZoom(){lastMove=Date.now();wheelStamp=lastMove;wheelConsumed=true;wheelTotal=0;navigate('galeria',0);}
function openDetails(){if(mode==='gallery'&&!trackBusy)navigate('projeto');}
$('name-link').onclick=e=>{e.stopPropagation();navigate('projeto',projects.length-1);};
$('overview').addEventListener('click',e=>{const card=e.target.closest('[data-index]');if(e.target.closest('#name-link'))return;if(card)navigate('galeria',Number(card.dataset.index));else navigate('galeria',0);});
$('prev').onclick=()=>move(-1);$('next').onclick=()=>move(1);$('all').onclick=()=>location.hash='';$('more').onclick=openDetails;
gallery.addEventListener('click',e=>{if(mode==='gallery'&&!e.target.closest('button,a'))openDetails();});
gallery.addEventListener('wheel',e=>{
 if(e.ctrlKey)return;
 if(mode==='gallery'){
  e.preventDefault();const now=Date.now(),unit=e.deltaMode===1?16:e.deltaMode===2?gallery.clientHeight:1,delta=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)*unit;
  if(now-wheelStamp>180){wheelTotal=0;wheelConsumed=false;}wheelStamp=now;
  if(trackBusy||now-lastMove<980){wheelConsumed=true;return;}if(wheelConsumed)return;
  if(wheelTotal&&Math.sign(wheelTotal)!==Math.sign(delta))wheelTotal=0;
  wheelTotal+=delta;if(Math.abs(wheelTotal)>=60){wheelConsumed=true;wheelTotal=0;lastMove=now;move(Math.sign(delta));}
 }
 else if(mode==='detail'&&e.deltaY<0&&gallery.scrollTop<=2){e.preventDefault();lastMove=Date.now();navigate('galeria');}
},{passive:false});
gallery.addEventListener('scroll',()=>{
 if(mode!=='detail')return;
 if(gallery.scrollTop>20)detailsReady=true;
 if(detailsReady&&gallery.scrollTop<=2){detailsReady=false;lastMove=Date.now();navigate('galeria');}
},{passive:true});
let touchX=0,touchY=0,touchTop=0;
gallery.addEventListener('touchstart',e=>{touchX=e.touches[0].clientX;touchY=e.touches[0].clientY;touchTop=gallery.scrollTop;},{passive:true});
gallery.addEventListener('touchend',e=>{if(e.target.closest('button,a'))return;const dx=touchX-e.changedTouches[0].clientX,dy=touchY-e.changedTouches[0].clientY;if(mode==='gallery'&&Math.max(Math.abs(dx),Math.abs(dy))>50)move(Math.sign(Math.abs(dx)>Math.abs(dy)?dx:dy));else if(mode==='detail'&&touchTop<=2&&dy<-50)navigate('galeria');},{passive:true});
function showLens(x,y){if(mode!=='gallery')return;lens.hidden=false;lens.style.transform='translate3d('+Math.max(10,Math.min(innerWidth-270,x-130))+'px,'+Math.max(80,Math.min(innerHeight-330,y-120))+'px,0)';$('process')?.setAttribute('aria-expanded','true');}

document.addEventListener('keydown',e=>{
 if(mode==='home'||e.target.closest('input,textarea,select,[contenteditable="true"]'))return;
 if(e.key==='Escape'){if(mode==='detail')gallery.scrollTo({top:0,behavior:reducedMotion.matches?'auto':'smooth'});else location.hash='';}
 if(mode==='gallery'){
  if(['ArrowRight','ArrowDown'].includes(e.key)){e.preventDefault();move(1);}
  if(['ArrowLeft','ArrowUp'].includes(e.key)){e.preventDefault();move(-1);}
  if(e.key==='Enter'&&e.target.id==='gallery-stage'){e.preventDefault();openDetails();}
 }else if(e.key==='ArrowUp'&&gallery.scrollTop<=2){e.preventDefault();navigate('galeria');}
 if(e.key==='Tab'){const controls=[...gallery.querySelectorAll('button:not(:disabled),a[href],input:not([type=hidden]),textarea,select,#gallery-stage')].filter(el=>!el.closest('[hidden]'));const soundButton=document.getElementById('sound-toggle');if(soundButton)controls.push(soundButton);const first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
});
let mapVisible=true;
function updateMotion(){grid.classList.toggle('motion-paused',document.hidden||!mapVisible||mode!=='home');}
if('IntersectionObserver' in window)new IntersectionObserver(entries=>{mapVisible=entries[0].isIntersecting;updateMotion();},{threshold:.05}).observe(grid);
document.addEventListener('visibilitychange',updateMotion);window.addEventListener('hashchange',route);route();
