const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),read=f=>fs.readFileSync(__dirname+'/../'+f,'utf8');
const scope={};vm.createContext(scope);vm.runInContext(read('conteudo.js')+';'+read('render-conteudo.js'),scope);
const projects=vm.runInContext('portfolioData.projects',scope);
for(const project of projects){
 const html=scope.renderProjectContent(project);
 if(project.about){assert.ok(!html.includes('project-visual-index'));continue;}
 assert.equal((html.match(/class="project-visual-index"/g)||[]).length,1);
 const targets=[...html.matchAll(/data-project-chapter="(\d+)"/g)].map(m=>m[1]);
 assert.ok(targets.length>=2);for(const target of targets)assert.ok(html.includes('data-chapter="'+target+'"'));
 assert.ok(html.indexOf('project-visual-index')<html.indexOf('data-chapter="1"'));
}
const events={},gallery={scrollTop:400,getBoundingClientRect:()=>({top:20}),scrollTo(o){this.destination=o;}};
const target={dataset:{chapter:'1'},getBoundingClientRect:()=>({top:900}),focus(o){this.focused=o;}};
const card={dataset:{projectChapter:'1'},closest:()=>({querySelectorAll:()=>[target]})};
vm.runInNewContext(read('project-gallery.js'),{document:{getElementById:()=>gallery,addEventListener:(k,f)=>events[k]=f},matchMedia:()=>({matches:true})});
events.click({target:{closest:s=>s==='[data-project-chapter]'?card:null}});
assert.equal(gallery.destination.top,1248);assert.equal(gallery.destination.behavior,'auto');assert.equal(target.focused.preventScroll,true);
console.log('OK: galeria em todos os estudos, destinos existentes, posição antes do processo, navegação e movimento reduzido.');
