const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../brand-intro.js','utf8');
function run(hash='',reduce=false){
 const element={hidden:true,classList:{add(){}}},frames=[],timers=[],events={};
 vm.runInNewContext(source,{document:{getElementById:()=>element},location:{hash},matchMedia:()=>({matches:reduce}),requestAnimationFrame:fn=>frames.push(fn),setTimeout:(fn,ms)=>{timers.push({fn,ms});return 1;},clearTimeout(){},window:{addEventListener:(name,fn)=>events[name]=fn,removeEventListener:name=>delete events[name]}});
 return {element,frames,timers,events};
}
let state=run();assert.equal(state.element.hidden,false);state.frames[0]();assert.equal(state.timers[0].ms,1100);state.timers[0].fn();assert.equal(state.element.hidden,true);
for(const hash of ['#projeto/identidade','#galeria/sobre']){state=run(hash);assert.equal(state.element.hidden,true);assert.equal(state.frames.length,0);}
state=run('',true);assert.equal(state.element.hidden,true);assert.equal(state.frames.length,0);
state=run();state.events.hashchange();state.frames[0]();assert.equal(state.element.hidden,true);assert.equal(state.timers.length,0);
console.log('OK: abertura, duração, rotas diretas, movimento reduzido e navegação durante a abertura.');
