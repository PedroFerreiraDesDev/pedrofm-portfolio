const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const r={};vm.createContext(r);vm.runInContext(read('conteudo.js')+'\n'+read('render-conteudo.js'),r);
const projects=vm.runInContext('portfolioData.projects',r);
for(const p of projects){
 const html=r.renderProjectContent(p);
 assert.equal(html.includes('class="contact-form"'),!p.about);
 if(p.about)continue;
 assert.ok(html.includes('action="https://formsubmit.co/oi@pedrofm.com" method="POST"'));
 assert.ok(html.includes('name="message" required'));
 assert.ok(!html.includes('onsubmit=')&&!html.includes('type="submit" disabled'));
 assert.ok(!html.includes('class="sequence-detail"'));
 assert.ok(html.includes('aria-label="Navegação entre projetos"'));
 assert.ok(!html.includes('Próximo projeto: Espaço'));
 const index=projects.filter(p=>!p.about).findIndex(q=>q.id===p.id),all=projects.filter(p=>!p.about);
 assert.ok(html.includes('href="#projeto/'+all[(index+1)%all.length].id+'"'));
}
const hostile=r.projectContact({id:'identidade',title:'"><script>bad()</script>'});assert.ok(!hostile.includes('<script>bad()'));
function emitter(){return {events:{},addEventListener(k,f){(this.events[k]??=[]).push(f);},emit(k,event={}){for(const f of this.events[k]||[])f(event);}};}
async function fixture(saved,blocked=false){
 const document=Object.assign(emitter(),{hidden:false,hasFocus:()=>true,getElementById:()=>label});
 const window=emitter(),label={textContent:''},toggle=Object.assign(emitter(),{attrs:{},setAttribute(k,v){this.attrs[k]=v;}});
 let ctx,allowed=!blocked,storage=saved;const calls=[];
 class Audio extends Object{constructor(){super();Object.assign(this,emitter());this.state='suspended';ctx=this;}resume(){if(allowed){this.state='running';this.emit('statechange');return Promise.resolve();}return new Promise(()=>{});}suspend(){this.state='suspended';this.emit('statechange');return Promise.resolve();}}
 window.AudioContext=Audio;
 vm.runInNewContext(read('sound-controls.js'),{window,document,location:{hash:'#projeto/identidade'},localStorage:{getItem:()=>storage,setItem:(_,v)=>storage=v}});
 window.createPedroSoundControls(toggle,{load:async()=>({createSonicWind:()=>({setScene:v=>calls.push(['scene',v]),setEnabled:async v=>calls.push(['enabled',v]),playClick(){},modulate(){}})})});
 const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};await flush();
 return {window,document,label,toggle,calls,flush,get ctx(){return ctx;},allow(){allowed=true;},get storage(){return storage;}};
}
(async()=>{
 const a=await fixture(null);assert.equal(a.label.textContent,'Som: ligado');assert.ok(a.calls.some(x=>x[0]==='scene'&&x[1]));
 a.window.emit('blur');await a.flush();assert.equal(a.ctx.state,'suspended');assert.equal(a.storage,null);
 a.window.emit('focus');await a.flush();assert.equal(a.label.textContent,'Som: ligado');
 a.toggle.emit('click',{stopPropagation(){}});await a.flush();assert.equal(a.storage,'off');assert.equal(a.ctx.state,'suspended');
 a.window.emit('blur');a.window.emit('focus');await a.flush();assert.equal(a.label.textContent,'Som: pausado');
 const b=await fixture('off');assert.equal(b.ctx,undefined);assert.equal(b.label.textContent,'Som: pausado');
 const c=await fixture(null,true);assert.equal(c.label.textContent,'Som: toque para ouvir');c.allow();c.document.emit('pointerdown',{target:{closest:()=>null}});await c.flush();assert.equal(c.label.textContent,'Som: ligado');
 c.document.hidden=true;c.document.emit('visibilitychange');await c.flush();assert.equal(c.ctx.state,'suspended');
 console.log('OK: formulário/destinatário, campos, navegação circular, texto removido; som padrão, bloqueio autoplay, gesto, pausa manual e segundo plano.');
})().catch(e=>{console.error(e);process.exitCode=1;});
