/* Navegação: o conteúdo é editado em conteudo.js. */
const projects=[...portfolioData.projects.filter(p=>!p.about),...portfolioData.projects.filter(p=>p.about)];
const $=id=>document.getElementById(id),grid=$('grid'),gallery=$('gallery'),track=$('track'),lens=$('lens'),details=$('case');
const word=p=>escapeContent(p.word).replaceAll('\n','<br>');
let current=0,mode='home',detailsReady=false,lensFrame=0,lensPoint=null;
grid.innerHTML=projects.filter(p=>!p.about).map((p,i)=>'<div class="map-node" style="--entry-x:'+([-55,55,-55,55][i%4])+'vw;--entry-y:'+([-35,-35,35,35][i%4])+'vh"><button class="card" style="background:'+p.color+';color:#101010" data-index="'+i+'" aria-label="Abrir '+escapeContent(p.title)+'"><span class="card-face"><span class="n">0'+(i+1)+' / '+escapeContent(p.category)+'</span><strong class="cover-word">'+word(p)+'</strong><span class="card-bottom">PROVISÓRIO</span></span><span class="card-hover-tint" aria-hidden="true"></span><span class="card-summary">'+escapeContent(p.summary)+'</span></button></div>').join('');
track.innerHTML=[projects.at(-1),...projects,projects[0]].map(p=>'<div data-project-id="'+escapeContent(p.id)+'" class="slide" style="background:'+p.color+';color:#101010"><span class="slot">'+(p.about?'PEDRO.FM / PERFIL EM CONSTRUÇÃO':'ESPAÇO PROVISÓRIO · CAPA PENDENTE')+'</span><strong class="cover-word">'+word(p)+'</strong></div>').join('');
function arrangeMap(){
 const nodes=[...grid.querySelectorAll('.map-node')];grid.classList.toggle('expanded-map',nodes.length>4);if(nodes.length<=4)return;
 const cols=innerWidth<=700?2:3,rows=Math.ceil(nodes.length/cols),step=68/rows;
 nodes.forEach((node,i)=>{node.style.setProperty('--tilt',(i%2?2:-3)+'deg');node.style.setProperty('--auto-left',(5+(i%cols)*90/cols)+'%');node.style.setProperty('--auto-top',(22+Math.floor(i/cols)*step)+'%');node.style.setProperty('--auto-width',(90/cols-3)+'%');node.style.setProperty('--auto-height',(step-3)+'dvh');node.style.setProperty('--auto-type','clamp(16px,'+Math.min(innerWidth<=700?2.6:4,step*.19)+'vh,56px)');});
}
window.addEventListener('resize',arrangeMap,{passive:true});arrangeMap();
function navigate(kind,index=current){location.hash=kind+'/'+projects[index].id;}
function hideLens(){lensPoint=null;if(lensFrame)cancelAnimationFrame(lensFrame);lensFrame=0;lens.hidden=true;$('process')?.setAttribute('aria-expanded','false');}
// O título, o contato e o clique acompanham a capa mais próxima do centro.
let shown = -1, waitingRoute = false, wheelTail = null, lastWheel = null;
const wrap = index => (index + projects.length) % projects.length;
const cover = coverMotion({
 width: () => gallery.clientWidth,
 reduced: () => reducedMotion.matches,
 raf: callback => requestAnimationFrame(callback),
 cancel: id => cancelAnimationFrame(id),
 paint(position) {
  track.style.transform = 'translate3d(' + (-(current + 1 + position) * 100) + '%,0,0)';
  const lift = Math.sin(Math.PI * Math.abs(position));
  track.style.setProperty('--paper-lift', (-lift * 18) + 'px');
  track.style.setProperty('--paper-turn', (lift * Math.sign(position) * 1.2) + 'deg');
  const index = wrap(current + (Math.abs(position) >= .5 ? Math.sign(position) : 0));
  if (index !== shown) labelCover(index);
 },
 arrive(direction) {
  if (waitingRoute || mode !== 'gallery') return;
  waitingRoute = true;
  if (lastWheel && Date.now() - lastWheel.at < 180) wheelTail = {...lastWheel};
  navigate('galeria', wrap(current + direction));
 }
});
function renderGallery(){
 cover.reset();
 waitingRoute = false;
 track.style.transform = 'translate3d(' + (-(current + 1) * 100) + '%,0,0)';
 track.style.removeProperty('--paper-lift');
 track.style.removeProperty('--paper-turn');
 labelCover(current);
}
function labelCover(index){
 shown=index;
 const p=projects[index];
 $('gallery-contact').href='#projeto/'+p.id+'/contato';
 $('counter').textContent='0'+(index+1)+' / 0'+projects.length;$('category').textContent=p.category;$('project-title').textContent=p.title;$('lens-title').textContent=p.lens;$('prev').disabled=false;$('next').disabled=false;hideLens();
}
function renderDetails(p){details.innerHTML=renderProjectContent(p);details.querySelector('[data-close]').onclick=()=>gallery.scrollTo({top:0,behavior:reducedMotion.matches?'auto':'smooth'});}
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
function route(){
 const parts=location.hash.slice(1).split('/'),index=projects.findIndex(p=>p.id===parts[1]);
 const next=index>=0&&['galeria','projeto'].includes(parts[0])?(parts[0]==='projeto'?'detail':'gallery'):'home';
 const wasHome=mode==='home',changed=index>=0&&index!==current,reuseDetails=mode==='detail'&&index===current;
 if(next!=='gallery'){cover.reset();waitingRoute=false;wheelTail=lastWheel=null;}
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
function move(direction){
 if(mode==='gallery'&&!waitingRoute)cover.select(direction);
}
function enterGalleryFromZoom(wheel={}){
 wheelTail = wheel.at && Date.now()-wheel.at<180 ? {at:wheel.at,delta:wheel.delta} : null;
 navigate('galeria',0);
}
function openDetails(index=shown){
 if(mode==='gallery'&&!waitingRoute)navigate('projeto',index);
}
$('name-link').onclick=e=>{e.stopPropagation();navigate('projeto',projects.length-1);};
$('overview').addEventListener('click',e=>{const card=e.target.closest('[data-index]');if(e.target.closest('#name-link'))return;if(card)navigate('galeria',Number(card.dataset.index));else navigate('galeria',0);});
$('prev').onclick=()=>move(-1);$('next').onclick=()=>move(1);$('all').onclick=()=>location.hash='';$('more').onclick=()=>openDetails();
gallery.addEventListener('click',e=>{if(mode!=='gallery'||e.target.closest('button,a')||Date.now()<swipeUntil)return;
 const id=e.target.closest('[data-project-id]')?.dataset.projectId;
 openDetails(id?projects.findIndex(p=>p.id===id):shown);});
gallery.addEventListener('wheel',e=>{
 if(e.ctrlKey)return;
 if(mode==='gallery'){
  e.preventDefault();const now=Date.now(),unit=e.deltaMode===1?16:e.deltaMode===2?gallery.clientHeight:1,delta=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)*unit;
  if(!delta || waitingRoute)return;
  lastWheel={at:now,delta};
  if(wheelTail){
   const continuing=now-wheelTail.at<180 && Math.sign(delta)===Math.sign(wheelTail.delta)
     && Math.abs(delta)<=Math.abs(wheelTail.delta)*1.3+2;
   // Inércia em queda não começa outra capa, mas uma rolagem sustentada volta a responder.
   const expires=wheelTail.expires || wheelTail.at+550;
   wheelTail=continuing && now<expires ? {at:now,delta,expires} : null;
   if(wheelTail)return;
  }
  cover.feed(Math.max(-120,Math.min(120,delta)));
 }
 else if(mode==='detail'&&e.deltaY<0&&gallery.scrollTop<=2){e.preventDefault();navigate('galeria');}
},{passive:false});
gallery.addEventListener('scroll',()=>{
 if(mode!=='detail')return;
 if(gallery.scrollTop>20)detailsReady=true;
 if(detailsReady&&gallery.scrollTop<=2){detailsReady=false;navigate('galeria');}
},{passive:true});
let touchX=0,touchY=0,touchTop=0,touchAxis='',touchActive=false,swipeUntil=0;
gallery.addEventListener('touchstart',e=>{
 touchX=e.touches[0].clientX;touchY=e.touches[0].clientY;touchTop=gallery.scrollTop;touchAxis='';
 touchActive=mode==='gallery' && e.touches.length===1 && !e.target.closest('button,a');
},{passive:true});
gallery.addEventListener('touchmove',e=>{
 if(e.touches.length!==1)touchActive=false;
 if(!touchActive||waitingRoute||mode!=='gallery')return;
 const {clientX:x,clientY:y}=e.touches[0],dx=touchX-x,dy=touchY-y;
 if(!touchAxis && Math.max(Math.abs(dx),Math.abs(dy))<6)return;
 if(!touchAxis)touchAxis=Math.abs(dx)>Math.abs(dy)?'x':'y';
 e.preventDefault();cover.feed(touchAxis==='x'?dx:dy,true);
 touchX=x;touchY=y;swipeUntil=Date.now()+400;
},{passive:false});
gallery.addEventListener('touchcancel',()=>{touchActive=false;},{passive:true});
gallery.addEventListener('touchend',e=>{
 touchActive=false;
 if(mode==='detail'&&touchTop<=2&&e.changedTouches[0].clientY-touchY>50)navigate('galeria');
},{passive:true});
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
