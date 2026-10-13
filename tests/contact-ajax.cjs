const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(__dirname+'/../contact.js','utf8');
function fixture(response={ok:true,success:true}){
 const events={},nodes={'button':{addEventListener(){},textContent:''},h2:{},p:{}};
 const popup={dataset:{},open:false,setAttribute(){},querySelector:s=>nodes[s],addEventListener(){},showModal(){this.open=true},close(){this.open=false}};
 let calls=0,payload,reset=0,prevented=0,release;
 const choices=[{checked:true,setCustomValidity(v){this.validation=v;}},{checked:true}];
 const status={},button={},form={dataset:{},isConnected:true,matches:()=>true,querySelectorAll:()=>choices,querySelector:s=>s==='[type=submit]'?button:status,setAttribute(){},removeAttribute(){},reportValidity:()=>!choices[0].validation,reset(){reset++}};
 class Data{get(){return ''}getAll(){return ['Branding','Editorial']}*[Symbol.iterator](){yield ['email','test@example.com'];yield ['message','Briefing'];yield ['project','editorial'];}}
 const fetch=async(url,options)=>{calls++;payload=JSON.parse(options.body);assert.equal(url,'https://formsubmit.co/ajax/oi@pedrofm.com');if(response.pending)await new Promise(r=>release=r);if(response.error)throw Error('network');return {ok:response.ok,json:async()=>({success:response.success})};};
 vm.runInNewContext(code,{document:{addEventListener:(k,f)=>events[k]=f,createElement:()=>popup,body:{append(){}}},FormData:Data,fetch,AbortController,setTimeout,clearTimeout});
 return {submit:()=>events.submit({target:form,preventDefault(){prevented++}}),form,choices,popup,status,button,get reset(){return reset},get calls(){return calls},get payload(){return payload},get prevented(){return prevented},release:()=>release()};
}
(async()=>{
 const a=fixture();await a.submit();assert.equal(a.prevented,1);assert.equal(a.reset,1);assert.equal(a.popup.dataset.state,'success');assert.equal(a.payload.interests,'Branding, Editorial');assert.equal(a.button.disabled,false);
 for(const response of [{ok:false,success:true},{ok:true,success:false},{error:true}]){const b=fixture(response);await b.submit();assert.equal(b.reset,0);assert.equal(b.popup.dataset.state,'error');assert.equal(b.button.disabled,false);}
 const c=fixture();c.choices.forEach(x=>x.checked=false);await c.submit();assert.equal(c.calls,0);
 const d=fixture({ok:true,success:'true',pending:true});const pending=d.submit();await d.submit();assert.equal(d.calls,1);assert.equal(d.popup.dataset.state,'sending');d.release();await pending;assert.equal(d.reset,1);
 console.log('OK AJAX: sucesso, recusa, erro de rede, dados preservados, múltiplos interesses, seleção obrigatória e envio duplicado.');
})().catch(e=>{console.error(e);process.exitCode=1;});
