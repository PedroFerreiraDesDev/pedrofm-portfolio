const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
const render={};vm.createContext(render);vm.runInContext(read('render-conteudo.js'),render);
const projects=vm.runInNewContext(read('conteudo.js')+';portfolioData.projects');
for(const project of projects){
 const html=render.renderProjectContent(project);
 assert.equal(html.includes('data-resonance-project'),!project.about);
 assert.ok(!html.includes('discovery-lab'));
 const images=(project.sections||[]).filter(b=>['image','pair'].includes(b.type)&&b.image?.src).length;
 assert.equal((html.match(/class="resonance-band"/g)||[]).length,project.about?0:(images-(project.id==='experiencia'?1:0))*7);
 assert.ok(!html.includes('loading="eager"'));
}
const picture=render.imageContent({src:'assets/example.webp',alt:'Descrição única',width:800,height:600},true);
assert.equal((picture.match(/alt="Descrição única"/g)||[]).length,1);
assert.equal((picture.match(/aria-hidden="true"/g)||[]).length,8);
assert.ok(!render.imageContent({src:'javascript:alert(1)'},true).includes('resonance-band'));

// Movimento real executado em um DOM mínimo: scroll, reversibilidade e acessibilidade.
const events={},frames=[];
const classes=(values=[])=>({add(...names){values.push(...names);},contains:name=>values.includes(name)});
const details={hidden:false,addEventListener:(key,fn)=>events['detail:'+key]=fn};
const bands=Array.from({length:7},()=>({style:{}}));
const blocks=[false,true].map((visual,i)=>({offsetTop:500+i*10,offsetHeight:500,offsetParent:details,style:{},classList:classes(visual?['story-visual']:[]),querySelectorAll:()=>visual?bands:[]}));
details.querySelectorAll=s=>s==='.resonance-surface'?[]:blocks;
const gallery={hidden:false,scrollTop:1000,clientHeight:900,classList:classes(),addEventListener:(key,fn)=>events[key]=fn};
const plane={style:{},append(){},animate(){return{cancel(){}};}};
const track={replaceWith(){},addEventListener:(key,fn)=>events[key]=fn};
const motion={matches:false,addEventListener:(key,fn)=>events.motion=fn};
const scope={innerWidth:1440,innerHeight:900,document:{hidden:false,body:{classList:classes()},getElementById:id=>({gallery,case:details,track})[id],createElement:()=>plane,addEventListener:(key,fn)=>events[key]=fn},window:{PedroResonance:{enabled:true,amplitude:30,depth:90,frequency:3,intensity:.65},addEventListener:(key,fn)=>events[key]=fn},matchMedia:()=>motion,requestAnimationFrame:fn=>{frames.push(fn);return frames.length;}};
vm.runInNewContext(read('story.js'),scope);
const flush=()=>{let count=0;while(frames.length){frames.shift()();assert.ok(++count<200);}};
flush();const first=bands[0].style.transform;
assert.notEqual(first,bands[1].style.transform);
gallery.scrollTop=1300;events.scroll();flush();assert.notEqual(bands[0].style.transform,first);
gallery.scrollTop=1000;events.scroll();flush();assert.equal(bands[0].style.transform,first);
events['detail:pointermove']({pointerType:'mouse',clientX:1300});flush();assert.notEqual(bands[0].style.transform,first);assert.equal(frames.length,0);
const desktop=Math.abs(Number(bands[0].style.transform.match(/translate3d\(0,([^p]+)/)[1]));
scope.innerWidth=390;events.resize();flush();const mobile=Math.abs(Number(bands[0].style.transform.match(/translate3d\(0,([^p]+)/)[1]));assert.ok(mobile<desktop);
motion.matches=true;events.motion();flush();assert.equal(bands[0].style.transform,'none');assert.equal(blocks[0].style.transform,'none');
scope.window.PedroResonance.intensity=0;motion.matches=false;events.motion();flush();assert.match(bands[0].style.transform,/translate3d\(0,0px,0px\)/);
scope.document.hidden=true;events.scroll();flush();assert.equal(frames.length,0);

(async()=>{
 // Configuração sob demanda, cache e prevenção de respostas antigas na navegação.
 let visible,fetches=0,inner={dataset:{resonanceProject:'identidade'},isConnected:true};const listeners={},notifications=[];
 const configScope={window:{addEventListener:(k,f)=>listeners[k]=f,dispatchEvent(){notifications.push(this.PedroResonance);}},document:{getElementById:()=>({querySelector:()=>inner})},Event,AbortController,setTimeout,clearTimeout,IntersectionObserver:class{constructor(fn){visible=fn;}observe(){}disconnect(){}},fetch:async()=>{fetches++;return{ok:true,json:async()=>({version:1,defaults:{amplitude:999,depth:-5,frequency:0,intensity:2},projects:{}})};}};
 configScope.window.IntersectionObserver=configScope.IntersectionObserver;
 vm.runInNewContext(read('discovery.js'),configScope);assert.equal(fetches,0);
 visible([{isIntersecting:true}]);await new Promise(setImmediate);
 assert.equal(fetches,1);assert.equal(configScope.window.PedroResonance.amplitude,60);assert.equal(configScope.window.PedroResonance.depth,0);assert.equal(configScope.window.PedroResonance.frequency,1);assert.equal(configScope.window.PedroResonance.intensity,1);
 inner={dataset:{resonanceProject:'editorial'},isConnected:true};listeners.hashchange();visible([{isIntersecting:true}]);
 inner=null;listeners.hashchange();await new Promise(setImmediate);
 assert.equal(configScope.window.PedroResonance.enabled,false);assert.equal(fetches,1);
 console.log('OK: sete estudos sem quadro, imagens acessíveis, scroll reversível, ponteiro, repouso, celular, movimento reduzido, JSON limitado/cache e navegação sem resposta antiga.');
})().catch(error=>{console.error(error);process.exitCode=1;});
