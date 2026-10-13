const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),read=f=>fs.readFileSync(__dirname+'/../'+f,'utf8');
const scope={};vm.createContext(scope);vm.runInContext(read('conteudo.js')+';'+read('render-conteudo.js'),scope);
const projects=vm.runInContext('portfolioData.projects',scope);
for(const project of projects){
 const html=scope.renderProjectContent(project);
 if(project.about){assert.ok(!html.includes('project-visual-index'));continue;}
 assert.equal((html.match(/class="project-visual-index"/g)||[]).length,1);
 const count=project.sections.filter(b=>b.image?.src).length;
 assert.equal((html.match(/class="project-gallery-card"/g)||[]).length,count);
 assert.ok(!html.includes('data-gallery-step'));
 assert.ok(html.includes('data-gallery-skip'));
 assert.ok(html.includes('A forma continua.'));
 assert.ok(html.indexOf('project-visual-index')<html.indexOf('data-chapter="1"'));
}
const custom=scope.projectVisualIndex({sections:[{title:'Vertical',image:{src:'assets/v.webp',width:600,height:900}},{title:'Horizontal',image:{src:'assets/h.webp',width:1600,height:900}},{title:'Quadrada',image:{src:'assets/s.webp',width:900,height:900}}]});
assert.ok(custom.includes('width="1600" height="900"'));
assert.ok(custom.includes('width="600" height="900"'));
assert.ok(custom.includes('width="900" height="900"'));
assert.ok(!scope.projectVisualIndex({sections:[]}));
console.log('OK: galeria finita, todas as imagens, formatos preservados, saída explícita e ausência de setas.');
