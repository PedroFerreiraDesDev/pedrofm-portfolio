/* Renderiza somente conteúdo. Navegação e animações continuam em app.js e story.js. */
function escapeContent(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
function safeAsset(src){return typeof src==='string'&&/^(https:\/\/|assets\/)/i.test(src)&&!src.split('/').includes('..');}
function mediaDimension(value,fallback){const number=Number(value);return Number.isFinite(number)&&number>0&&number<=10000?Math.round(number):fallback;}
function imageContent(image){
 if(!image||!image.src)return '';
 const src=String(image.src);
 if(!safeAsset(src))return '<p class="pending">Use uma imagem em assets/ ou um endereço HTTPS.</p>';
 const sources=Array.isArray(image.srcset)?image.srcset.filter(item=>safeAsset(item.src)&&Number(item.width)>0).map(item=>escapeContent(item.src)+' '+mediaDimension(item.width,1200)+'w').join(', '):'';
 const responsive=sources?' srcset="'+sources+'" sizes="(max-width: 760px) 88vw, 50vw"':'';
 const caption=image.caption?'<figcaption>'+escapeContent(image.caption)+'</figcaption>':'';
 return '<figure class="story-visual" style="--image-ratio:'+mediaDimension(image.width,720)+'/'+mediaDimension(image.height,900)+'"><img src="'+escapeContent(src)+'"'+responsive+' alt="'+escapeContent(image.alt||'Imagem do projeto')+'" loading="lazy" decoding="async" width="'+mediaDimension(image.width,720)+'" height="'+mediaDimension(image.height,900)+'">'+caption+'</figure>';
}
function textContentBlock(block){
 const heading=block.title?'<h2>'+escapeContent(block.title)+'</h2>':'';
 const paragraphs=Array.isArray(block.paragraphs)?block.paragraphs:[block.text||''];
 return heading+paragraphs.filter(Boolean).map(text=>'<p'+(block.pending?' class="pending"':'')+'>'+escapeContent(text)+'</p>').join('');
}

function videoContent(video){
 if(!video||!safeAsset(video.src))return '<p class="pending">Use um vídeo em assets/ ou um endereço HTTPS.</p>';
 const width=mediaDimension(video.width,1280),height=mediaDimension(video.height,720);
 const poster=safeAsset(video.poster)?' poster="'+escapeContent(video.poster)+'"':'';
 const track=safeAsset(video.captions)?'<track kind="captions" src="'+escapeContent(video.captions)+'" srclang="pt-BR" label="Português" default>':'';
 return '<figure class="story-visual story-video" style="--image-ratio:'+width+'/'+height+'"><video controls playsinline preload="none" width="'+width+'" height="'+height+'"'+poster+' aria-label="'+escapeContent(video.alt||'Vídeo do projeto')+'"><source src="'+escapeContent(video.src)+'" type="video/mp4">'+track+'Seu navegador não reproduz este vídeo.</video>'+(video.caption?'<figcaption>'+escapeContent(video.caption)+'</figcaption>':'')+'</figure>';
}
function fileContent(file){if(!file||!safeAsset(file.src))return '';return '<section><a class="back" data-download href="'+escapeContent(file.src)+'" download="'+escapeContent(file.name||file.src.split('/').pop())+'">'+escapeContent(file.label||'Baixar arquivo')+'</a>'+(file.description?'<p>'+escapeContent(file.description)+'</p>':'')+'</section>';}
function renderContentBlock(block,index){
 if(!block||typeof block!=='object')return '';
 if(block.type==='pair'){
  const reverse=block.imageSide==='left';
  return '<div class="story-pair'+(reverse?' reverse':'')+'" data-pair="'+index+'"><section class="story-copy" data-flow="'+(reverse?'copy-right':'copy-left')+'">'+textContentBlock(block)+'</section>'+imageContent(block.image).replace('class="story-visual"','class="story-visual" data-flow="'+(reverse?'image-left':'image-rise')+'"')+'</div>';
 }
 if(block.type==='video')return videoContent(block.video);
 if(block.type==='file')return fileContent(block.file);
 if(block.type==='image')return imageContent(block.image);
 if(block.type==='text')return '<section>'+textContentBlock(block)+'</section>';
 return '';
}

function discoveryContent(project){
 if(project.about)return '';
 const image=(project.sections||[]).map(b=>b.image).find(img=>img&&safeAsset(img.src));
 const face=image?'<img src="'+escapeContent(image.src)+'" alt="" width="'+mediaDimension(image.width,720)+'" height="'+mediaDimension(image.height,900)+'" loading="lazy" decoding="async">':'<strong class="discovery-word">'+escapeContent(project.word).replaceAll('\n','<br>')+'</strong>';
 const strips=Array.from({length:7},(_,i)=>'<div class="discovery-band" style="--band:'+i+'" aria-hidden="true">'+face+'</div>').join('');
 return '<section class="discovery-lab" data-project="'+escapeContent(project.id)+'" style="--project-color:'+escapeContent(project.color)+'"><header class="discovery-heading"><p class="eyebrow">POR TRÁS DA FORMA</p><h2>A forma ganha movimento.</h2><p>Mova o ponteiro, experimente uma sintonia e descubra as camadas.</p></header><div class="discovery-controls" role="group" aria-label="Modo de descoberta"><button type="button" data-variant="layers" aria-pressed="true">Camadas</button><button type="button" data-variant="resonance" aria-pressed="false">Ressonância</button><button type="button" data-variant="journey" aria-pressed="false">Percurso</button><label>Intensidade <input class="discovery-frequency" type="range" min="0" max="100" value="45" aria-label="Intensidade do vento"></label></div><figure class="discovery-stage story-visual" aria-label="Composição interativa de camadas do projeto"><canvas class="discovery-wave" aria-hidden="true"></canvas><div class="discovery-deck"><div class="discovery-sheet discovery-back"><span>01 / O DESAFIO</span><strong>Onde tudo começa.</strong></div><div class="discovery-sheet discovery-middle"><span>02 / AS ESCOLHAS</span><strong>O que sustenta a forma.</strong></div><div class="discovery-sheet discovery-front">'+strips+'</div></div><figcaption>ESTUDO DE INTERAÇÃO · MATERIAL PROVISÓRIO</figcaption></figure><p class="discovery-note" aria-live="polite">Camadas: a superfície se abre e deixa as escolhas aparecerem.</p></section>';
}
function renderProjectContent(project){
 const metadata=Array.isArray(project.metadata)?project.metadata:[];
 const intro='<p class="eyebrow">'+escapeContent(project.category)+(project.provisional?' / CONTEÚDO EM PREPARAÇÃO':'')+'</p><h1>'+escapeContent(project.title)+'</h1>';
 const lead=project.lead?'<p class="lead">'+escapeContent(project.lead)+'</p>':'';
 const info=metadata.length?'<div class="metadata">'+metadata.map(item=>'<div><strong>'+escapeContent(item.label)+'</strong><p>'+escapeContent(item.value)+'</p></div>').join('')+'</div>':'';
 return '<div class="detail-inner">'+intro+lead+info+discoveryContent(project)+(project.sections||[]).map(renderContentBlock).join('')+'<button class="back" data-close>Voltar à capa</button>'+(project.about?'<a class="back" href="codigo.html">Consultar o código</a>':'')+'</div>';
}
