const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const data=vm.runInNewContext(fs.readFileSync(path.join(__dirname,'conteudo.js'),'utf8')+';portfolioData');
const ids=new Set(),errors=[],warnings=[];
function asset(src,id,budget){if(typeof src!=='string'||!(/^(assets\/|https:\/\/)/.test(src))||src.split('/').includes('..')){errors.push(id+': caminho inválido '+src);return;}if(src.startsWith('assets/')){const file=path.join(__dirname,src);if(!fs.existsSync(file)){errors.push(id+': arquivo não encontrado '+src);return;}if(fs.statSync(file).size>budget)warnings.push(id+': arquivo acima da meta de peso '+src);}}
function dimensions(media,id){if(!Number.isFinite(media?.width)||!Number.isFinite(media?.height)||media.width<=0||media.height<=0)errors.push(id+': width e height devem ser números positivos');}
function image(media,id){asset(media?.src,id,500*1024);dimensions(media,id);if(!media?.alt?.trim())warnings.push(id+': descreva a imagem em alt');for(const item of media?.srcset||[]){asset(item.src,id,500*1024);if(!Number.isFinite(item.width)||item.width<=0)errors.push(id+': largura inválida no srcset');}}
for(const p of data.projects){
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.id)||ids.has(p.id))errors.push('ID inválido ou repetido: '+p.id);ids.add(p.id);
 for(const key of ['title','word','category','summary'])if(!p[key]&&!p.about)errors.push(p.id+': falta '+key);
 if(!/^#[a-f0-9]{6}$/i.test(p.color))errors.push(p.id+': cor deve ser hexadecimal com seis dígitos');
 if((p.word||'').split('\n').some(line=>line.length>12)||(p.word||'').split('\n').length>2)warnings.push(p.id+': revise o título da capa no celular');
 if((p.summary||'').length>100)warnings.push(p.id+': resumo pode ser cortado no mapa');
 if(!Array.isArray(p.sections))errors.push(p.id+': sections deve ser uma lista');
 for(const b of p.sections||[]){if(!b||typeof b!=='object'){errors.push(p.id+': bloco inválido');continue;}
  if(!['text','pair','image','video','file'].includes(b.type)){errors.push(p.id+': tipo de bloco desconhecido '+b.type);continue;}
  if(['text','pair'].includes(b.type)&&(!Array.isArray(b.paragraphs)||b.paragraphs.some(t=>typeof t!=='string')))errors.push(p.id+': paragraphs deve ser uma lista de textos');
  if(['pair','image'].includes(b.type))image(b.image,p.id);
  if(b.type==='pair'&&!['left','right'].includes(b.imageSide))errors.push(p.id+': imageSide deve ser left ou right');
  if(b.type==='video'){asset(b.video?.src,p.id,8*1024*1024);dimensions(b.video,p.id);if(!/\.mp4(?:\?|$)/i.test(b.video?.src||''))errors.push(p.id+': o bloco de vídeo aceita MP4');if(b.video?.poster)asset(b.video.poster,p.id,200*1024);else warnings.push(p.id+': vídeo sem poster');if(b.video?.captions)asset(b.video.captions,p.id,300*1024);}
  if(b.type==='file'){asset(b.file?.src,p.id,5*1024*1024);if(!b.file?.label)warnings.push(p.id+': informe tipo e tamanho no rótulo do arquivo');}
 }
}
if(!ids.size)errors.push('Inclua ao menos um projeto.');
if(data.projects.filter(p=>p.about).length!==1)errors.push('Mantenha exatamente um perfil about: true.');
if(warnings.length)console.warn(warnings.map(w=>'AVISO: '+w).join('\n'));
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('OK: '+ids.size+' páginas, IDs únicos, arquivos presentes e blocos válidos.');
