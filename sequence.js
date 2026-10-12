/* Pedro.fm: uma cena, três tempos. CSS 3D para o conteúdo; WebGL para a membrana. */
(()=>{
 const gallery=document.getElementById('gallery'),motion=matchMedia('(prefers-reduced-motion: reduce)');let dispose=()=>{};
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
 // Função pura: o mesmo scroll retorna à mesma composição.
 function pose(progress,small=false){const reveal=ease((progress-.12)/.38),leave=ease((progress-.78)/.22);return{reveal,leave,titleX:-reveal*(small?0:27),titleY:-reveal*(small?22:12),titleScale:1-reveal*(small?.36:.57),imageX:(1-reveal)*(small?24:72)-leave*12,imageY:(1-reveal)*28-leave*18,imageRotate:(1-reveal)*-27+leave*9,imageTilt:(1-reveal)*38,opacity:ease((progress-.13)/.18)*(1-leave*.25)};}
 window.PedroSequencePose=pose;
 function membrane(canvas){
  const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:false,depth:false});if(!gl)return null;
  const vertex='attribute vec2 a; varying vec2 v; void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}';
  const fragment=`precision mediump float;
   varying vec2 v; uniform float phase,energy,progress,aspect; uniform vec2 pointer;
   float center(float x){return .47+.16*sin(x*5.8+phase*.7)+.075*sin(x*12.3-phase*.45)+pointer.y*.14*sin(x*3.14)+pointer.x*.08*cos(x*7.-phase)+.13*(progress-.5);}
   void main(){
    float x=v.x,y=v.y,mid=center(x);
    float taper=.035+.065*pow(sin(clamp(x,0.,1.)*3.14159),2.);
    float width=taper*(1.+energy*.95+.35*sin(x*8.-phase));
    float d=(y-mid)/width;
    float inside=1.-smoothstep(.75,1.04,abs(d));
    float edge=exp(-abs(abs(d)-.94)*42.);
    float fold=exp(-abs(d-.35*sin(x*13.+phase))*18.);
    float fibres=.5+.5*sin(d*65.+x*11.+phase);
    vec3 violet=vec3(.38,.20,.69),blue=vec3(.08,.48,.66);
    vec3 color=mix(violet,blue,.5+.5*sin(x*5.+d+phase*.15));
    float alpha=inside*(.025+fibres*.025)+edge*.58+fold*inside*.11;
    gl_FragColor=vec4(color,alpha);
   }`;
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);throw Error('Shader indisponível');}return s;}
  let program,buffer,vs,fs;
  try{vs=shader(gl.VERTEX_SHADER,vertex);fs=shader(gl.FRAGMENT_SHADER,fragment);program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('WebGL indisponível');gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const a=gl.getAttribLocation(program,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);}catch{if(program)gl.deleteProgram(program);if(vs)gl.deleteShader(vs);if(fs)gl.deleteShader(fs);return null;}
  const u=Object.fromEntries(['phase','energy','progress','pointer','aspect'].map(k=>[k,gl.getUniformLocation(program,k)]));
  return{draw(w,h,p,x,y,e,t){const ratio=Math.min(devicePixelRatio||1,1.25);const W=Math.round(w*ratio),H=Math.round(h*ratio);if(canvas.width!==W||canvas.height!==H){canvas.width=W;canvas.height=H;gl.viewport(0,0,W,H);}gl.uniform1f(u.phase,t);gl.uniform1f(u.energy,e);gl.uniform1f(u.progress,p);gl.uniform1f(u.aspect,w/h);gl.uniform2f(u.pointer,x,y);gl.drawArrays(gl.TRIANGLES,0,6);},destroy(){gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);gl.getExtension('WEBGL_lose_context')?.loseContext();}};
 }
 window.PedroMembrane=membrane;
 function mount(){
  dispose();const scene=document.querySelector('.wind-sequence');if(!scene||!gallery)return;
  const ownsAir=!scene.closest?.('.experience-flow');
  const events=new AbortController(),signal=events.signal,stage=scene.querySelector('.sequence-stage'),title=scene.querySelector('.sequence-title'),image=scene.querySelector('.sequence-image'),copy=scene.querySelector('.sequence-copy'),canvas=scene.querySelector('canvas'),meter=scene.querySelector('.sequence-progress'),label=scene.querySelector('.sequence-state'),letters=[...title.querySelectorAll('.sequence-letter')];
  const paperCanvas=scene.querySelector('.sequence-mesh'),photo=image.querySelector?.('img'),detail=scene.querySelector('.sequence-detail'),next=scene.nextElementSibling?.classList.contains('sequence-followup')?scene.nextElementSibling:null;
  let paper=null,paperAttempted=false,mouseX=Infinity,mouseY=Infinity;
  let renderer=null,attempted=false,frame=0,alive=true,x=0,y=0,tx=0,ty=0,energy=0,phase=0,lastTime=0,progress=0,lastProgress=0;
  const small=()=>innerWidth<=760||innerHeight<560;
  function schedule(){if(alive&&!document.hidden&&!frame)frame=requestAnimationFrame(draw);}
  function draw(time){
   frame=0;if(!alive||document.hidden)return;
   const rect=scene.getBoundingClientRect(),view=gallery.getBoundingClientRect(),height=gallery.clientHeight;
   const active=rect.top<view.top+height*.85&&rect.bottom>view.top+height*.15;
   if(ownsAir)document.body.classList.toggle('sequence-active',active&&!motion.matches);
   if(next){const nr=next.getBoundingClientRect(),arrival=ease((view.top+height*.92-nr.top)/(height*.75)),copyNext=next.querySelector('.story-copy'),imageNext=next.querySelector('.story-visual');[copyNext,imageNext].forEach((node,i)=>{if(!node)return;node.style.transform=motion.matches||small()?'none':'translate3d('+((1-arrival)*(i?100:-80))+'px,'+((1-arrival)*(i?100:35))+'px,0) rotate('+((1-arrival)*(i?-7:0))+'deg)';node.style.opacity=motion.matches||small()?'1':String(.3+.7*arrival);});}
   if(!active){lastTime=0;return;}
   if(!paperAttempted&&!motion.matches&&!small()&&paperCanvas&&photo&&window.PedroPaper){paperAttempted=true;paper=window.PedroPaper(paperCanvas,photo,ready=>{image.classList.toggle('mesh-ready',ready);schedule();});}
   if(ownsAir&&!attempted&&!motion.matches){attempted=true;try{renderer=membrane(canvas);}catch{}stage.classList.toggle('has-webgl',!!renderer);}
   const dt=lastTime?Math.min((time-lastTime)/16.667,3):1;lastTime=time;
   progress=clamp((view.top-rect.top)/Math.max(1,rect.height-height));
   energy=Math.min(1.5,energy+Math.abs(progress-lastProgress)*7);lastProgress=progress;
   const follow=1-Math.pow(.86,dt);x+=(tx-x)*follow;y+=(ty-y)*follow;energy*=Math.pow(.92,dt);phase+=energy*.045*dt;
   const p=pose(progress,small()),reduced=motion.matches||small();
   if(reduced){title.style.transform='none';image.style.transform='none';image.style.opacity='1';copy.style.opacity='1';copy.style.transform='none';}
   else{
    title.style.transform=`translate3d(${p.titleX}vw,${p.titleY}vh,0) scale(${p.titleScale}) rotateY(${x*3}deg)`;
    image.style.transform=`translate3d(${p.imageX}vw,${p.imageY}vh,${60*x}px) rotateY(${-p.imageTilt+x*11}deg) rotateX(${-y*9}deg) rotateZ(${p.imageRotate+x*2}deg)`;
    image.style.opacity=String(p.opacity);copy.style.opacity=String(ease((progress-.41)/.13));copy.style.transform=`translateY(${(1-ease((progress-.41)/.13))*40}px)`;
   }
   letters.forEach(letter=>{const box=letter.parentElement?.getBoundingClientRect?.(),distance=box?Math.hypot(mouseX-(box.left+box.width/2),mouseY-(box.top+box.height/2)):Infinity,near=Math.exp(-Math.pow(distance/90,2))*(.55+Math.min(energy,.8));letter.style.transform=motion.matches?'none':`translate3d(0,${-near*22}px,${near*28}px) rotateX(${near*18}deg)`;letter.style.color=!motion.matches&&near>.17?'#563393':'';});
   if(detail){detail.style.opacity=String(ease((progress-.62)/.12));detail.style.transform=motion.matches?'none':`translateY(${(1-ease((progress-.62)/.12))*25}px)`;}
   if(paper&&!motion.matches&&!small())paper.draw(paperCanvas.clientWidth,paperCanvas.clientHeight,(1-p.reveal)*.55+p.leave*.5+Math.min(energy,.5)*.035,x,y);
   meter.style.transform=`scaleX(${progress})`;label.textContent=progress<.12?'01 / PRESENÇA':progress<.5?'02 / APROXIMAÇÃO':progress<.65?'03 / OBSERVAÇÃO':progress<.78?'04 / DESCOBERTA':'05 / CONTINUIDADE';
   if(renderer&&!motion.matches)renderer.draw(stage.clientWidth,stage.clientHeight,progress,x,y,energy,phase+progress*5);
   if(!motion.matches&&(energy>.006||Math.abs(x-tx)+Math.abs(y-ty)>.002))schedule();
  }
  stage.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||motion.matches)return;mouseX=e.clientX;mouseY=e.clientY;const r=stage.getBoundingClientRect(),nx=clamp((e.clientX-r.left)/r.width)*2-1,ny=clamp((e.clientY-r.top)/r.height)*2-1;energy=Math.min(1.5,energy+Math.hypot(nx-tx,ny-ty)*3);tx=nx;ty=ny;schedule();},{passive:true,signal});
  stage.addEventListener('pointerleave',()=>{mouseX=mouseY=Infinity;tx=ty=0;schedule();},{signal});
  gallery.addEventListener('scroll',schedule,{passive:true,signal});window.addEventListener('resize',schedule,{passive:true,signal});motion.addEventListener('change',schedule,{signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;lastTime=0;}else schedule();},{signal});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();renderer=null;stage.classList.remove('has-webgl');},{signal});
  scene.querySelector('.sequence-skip').addEventListener('click',()=>{const r=scene.getBoundingClientRect(),v=gallery.getBoundingClientRect();gallery.scrollTo({top:gallery.scrollTop+r.bottom-v.top,behavior:motion.matches?'auto':'smooth'});},{signal});
  dispose=()=>{alive=false;events.abort();cancelAnimationFrame(frame);renderer?.destroy();paper?.destroy();if(ownsAir)document.body.classList.remove('sequence-active');};schedule();
 }
 window.addEventListener('hashchange',mount);mount();
})();
