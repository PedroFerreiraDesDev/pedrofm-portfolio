const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../app.js','utf8');
const route=source.slice(source.indexOf('function route(){'),source.indexOf('function move('));
for(const id of ['identidade','sobre']){
 const elements={},contact={getBoundingClientRect:()=>({top:2400}),focus:o=>contact.focused=o};
 const gallery={scrollTop:0,clientHeight:800,classList:{toggle(){}},getBoundingClientRect:()=>({top:0}),scrollTo:o=>gallery.destination=o};
 let renders=0;const context={projects:[{id:'identidade'},{id:'sobre'}],location:{hash:'#projeto/'+id+'/contato'},mode:'gallery',current:0,gallery,details:{querySelector:()=>contact},$:(id)=>elements[id]??={setAttribute(){},focus(){}},document:{body:{style:{},classList:{toggle(){}}},documentElement:{style:{}}},hideLens(){},renderGallery(){},renderDetails(){renders++},updateMotion(){},requestAnimationFrame:f=>f(),reducedMotion:{matches:false}};
 vm.createContext(context);vm.runInContext(route+';route();',context);
 assert.equal(gallery.destination.top,2376);assert.equal(contact.focused.preventScroll,true);assert.equal(renders,1);
 vm.runInContext('route()',context);assert.equal(renders,1);
 context.location.hash='#projeto/'+id;vm.runInContext('route()',context);assert.equal(gallery.destination.top,800);
}
console.log('OK: atalho por projeto/perfil, destino no contêiner correto, foco e formulário existente preservado.');
