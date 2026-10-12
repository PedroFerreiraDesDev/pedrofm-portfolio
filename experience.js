/* Atmosfera compartilhada e imagens contínuas ao longo do estudo. */
(()=>{
 const gallery=document.getElementById('gallery'),motion=matchMedia('(prefers-reduced-motion: reduce)');let dispose=()=>{};
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
 function mount(){
  dispose();const root=document.querySelector('.experience-flow');if(!root||!gallery)return;
  const events=new AbortController(),signal=events.signal,air=root.querySelector('.flow-atmosphere'),canvas=air.querySelector('canvas');
  const rows=[...root.querySelectorAll('.flow-row, .flow-intro')].map(node=>({node,copy:node.querySelector('.flow-copy'),figure:node.querySelector('.flow-picture'),paper:null,attempted:false,letters:[...node.querySelectorAll('.sequence-letter')]}));
  let alive=true,frame=0,renderer=null,attempted=false,x=0,y=0,tx=0,ty=0,mx=Infinity,my=Infinity,energy=0,phase=0,lastScroll=gallery.scrollTop,lastTime=0;
  const small=()=>innerWidth<=760||innerHeight<560;
  function schedule(){if(alive&&!document.hidden&&!frame)frame=requestAnimationFrame(draw);}
  function draw(time){
   frame=0;if(!alive||document.hidden||gallery.hidden)return;
   const r=root.getBoundingClientRect(),v=gallery.getBoundingClientRect(),height=gallery.clientHeight;
   const visible=r.bottom>v.top&&r.top<v.top+height;
   document.body.classList.toggle('sequence-active',visible&&!motion.matches);
   if(!visible){lastTime=0;return;}
   if(!attempted&&!motion.matches){attempted=true;try{renderer=window.PedroMembrane?.(canvas);}catch{}air.classList.toggle('has-webgl',!!renderer);}
   const dt=lastTime?Math.min((time-lastTime)/16.667,3):1;lastTime=time;
   energy=Math.min(1.4,energy+Math.abs(gallery.scrollTop-lastScroll)/height*4);lastScroll=gallery.scrollTop;
   x+=(tx-x)*(1-Math.pow(.86,dt));y+=(ty-y)*(1-Math.pow(.86,dt));energy*=Math.pow(.92,dt);phase+=energy*.04*dt;
   rows.forEach((row,index)=>{
    const rect=row.node.getBoundingClientRect(),near=rect.top<v.top+height*1.5&&rect.bottom>v.top-height*.5;
    if(!near){if(row.paper){row.paper.destroy();row.paper=null;row.attempted=false;row.figure.classList.remove('mesh-ready');}return;}
    const enter=ease((v.top+height*.95-rect.top)/(height*.6)),leave=ease((v.top-rect.bottom+height*.22)/(height*.42)),outside=1-enter;
    const still=motion.matches||small(),sign=row.node.classList.contains('flow-reverse')?-1:1;
    if(row.copy){row.copy.style.transform=still?'none':`translate3d(${-sign*outside*100}px,${outside*48}px,0)`;row.copy.style.opacity=still?'1':String(.45+.55*enter);}
    if(row.figure){
     const mesh=row.figure.querySelector('canvas'),photo=row.figure.querySelector('img');
     if(!row.attempted&&!still&&window.PedroPaper){row.attempted=true;row.paper=window.PedroPaper(mesh,photo,ready=>{row.figure.classList.toggle('mesh-ready',ready);schedule();});}
     const box=row.figure.getBoundingClientRect(),hover=mx>box.left&&mx<box.right&&my>box.top&&my<box.bottom;
     row.figure.style.transform=still?'none':`translate3d(${sign*outside*140}px,${outside*95-leave*40}px,0) rotateY(${sign*outside*24+(hover?x*7:0)}deg) rotateX(${hover?-y*6:0}deg) rotateZ(${sign*(-outside*9+leave*4)}deg)`;
     row.figure.style.opacity=still?'1':String(.4+.6*enter);
     if(row.paper&&!still)row.paper.draw(mesh.clientWidth,mesh.clientHeight,outside*.55+leave*.35+(hover?energy*.025:0),x,y);
    }
    row.letters.forEach(letter=>{const b=letter.parentElement.getBoundingClientRect(),distance=Math.hypot(mx-b.left-b.width/2,my-b.top-b.height/2),strength=Math.exp(-Math.pow(distance/85,2));letter.style.transform=still?'none':`translate3d(0,${-strength*16}px,${strength*22}px) rotateX(${strength*14}deg)`;letter.style.color=!still&&strength>.2?'#65429a':'';});
   });
   if(renderer&&!motion.matches)renderer.draw(air.clientWidth,height,clamp((v.top-r.top)/Math.max(1,r.height-height)),x,y,energy,phase+gallery.scrollTop/height*.8);
   if(!motion.matches&&(energy>.006||Math.abs(tx-x)+Math.abs(ty-y)>.002))schedule();
  }
  root.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||motion.matches)return;mx=e.clientX;my=e.clientY;const v=gallery.getBoundingClientRect(),nx=mx/innerWidth*2-1,ny=(my-v.top)/gallery.clientHeight*2-1;energy=Math.min(1.4,energy+Math.hypot(nx-tx,ny-ty)*2);tx=nx;ty=ny;schedule();},{passive:true,signal});
  root.addEventListener('pointerleave',()=>{mx=my=Infinity;tx=ty=0;schedule();},{signal});
  root.addEventListener('load',schedule,{capture:true,signal});gallery.addEventListener('scroll',schedule,{passive:true,signal});window.addEventListener('resize',schedule,{signal});motion.addEventListener('change',schedule,{signal});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();renderer=null;air.classList.remove('has-webgl');},{signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;lastTime=0;}else schedule();},{signal});
  dispose=()=>{alive=false;events.abort();cancelAnimationFrame(frame);renderer?.destroy();rows.forEach(row=>row.paper?.destroy());document.body.classList.remove('sequence-active');};schedule();
 }
 window.addEventListener('hashchange',mount);mount();
})();
