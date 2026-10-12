/* Renderiza somente conteúdo. Navegação e animações continuam em app.js e story.js. */
function escapeContent(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
function safeAsset(src){return typeof src==='string'&&/^(https:\/\/|assets\/)/i.test(src)&&!src.split('/').includes('..');}
function mediaDimension(value,fallback){const number=Number(value);return Number.isFinite(number)&&number>0&&number<=10000?Math.round(number):fallback;}
function imageContent(image,resonance=false){
 if(!image||!image.src)return '';
 const src=String(image.src);
 if(!safeAsset(src))return '<p class="pending">Use uma imagem em assets/ ou um endereço HTTPS.</p>';
 const sources=Array.isArray(image.srcset)?image.srcset.filter(item=>safeAsset(item.src)&&Number(item.width)>0).map(item=>escapeContent(item.src)+' '+mediaDimension(item.width,1200)+'w').join(', '):'';
 const responsive=sources?' srcset="'+sources+'" sizes="(max-width: 760px) 88vw, 50vw"':'';
 const caption=image.caption?'<figcaption>'+escapeContent(image.caption)+'</figcaption>':'';
 const html='<figure class="story-visual" style="--image-ratio:'+mediaDimension(image.width,720)+'/'+mediaDimension(image.height,900)+'"><img src="'+escapeContent(src)+'"'+responsive+' alt="'+escapeContent(image.alt||'Imagem do projeto')+'" loading="lazy" decoding="async" width="'+mediaDimension(image.width,720)+'" height="'+mediaDimension(image.height,900)+'">'+caption+'</figure>';
 if(!resonance)return html;
 return html.replace(/<img[^>]+>/,original=>{
  const decorative=original.replace(/alt="[^"]*"/,'alt="" aria-hidden="true"');
  return '<span class="resonance-surface">'+original+'<span class="resonance-bands" aria-hidden="true">'+Array.from({length:7},(_,i)=>'<span class="resonance-band" style="--band:'+i+'">'+decorative+'</span>').join('')+'</span></span>';
 });
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
function renderContentBlock(block,index,resonance=false){
 if(!block||typeof block!=='object')return '';
 if(block.type==='pair'){
  const reverse=block.imageSide==='left';
  return '<div class="story-pair'+(reverse?' reverse':'')+'" data-pair="'+index+'"><section class="story-copy" data-flow="'+(reverse?'copy-right':'copy-left')+'">'+textContentBlock(block)+'</section>'+imageContent(block.image,resonance).replace('class="story-visual"','class="story-visual" data-flow="'+(reverse?'image-left':'image-rise')+'"')+'</div>';
 }
 if(block.type==='video')return videoContent(block.video);
 if(block.type==='file')return fileContent(block.file);
 if(block.type==='image')return imageContent(block.image,resonance);
 if(block.type==='text')return '<section>'+textContentBlock(block)+'</section>';
 return '';
}

function representativeSequence(block){
 const letters=text=>[...text].map(char=>'<span class="sequence-glyph" aria-hidden="true"><span class="sequence-letter">'+(char===' '?'&nbsp;':escapeContent(char))+'</span></span>').join('');
 const image=block.image||{};
 return '<section class="wind-sequence" aria-label="Estudo de movimento: impulso, forma e passagem"><div class="sequence-stage"><canvas class="sequence-membrane" aria-hidden="true"></canvas><div class="sequence-fallback" aria-hidden="true"></div><div class="sequence-topline"><span>PEDRO.FM / ESTUDO DE MOVIMENTO</span><button class="sequence-skip" type="button">Pular sequência ↓</button></div><h2 class="sequence-title" aria-label="O invisível move a forma."><span class="sequence-title-line">'+letters('O invisível')+'</span><em class="sequence-title-line">'+letters('move a forma.')+'</em></h2><figure class="sequence-image"><span class="sequence-paper"><img src="'+escapeContent(image.src)+'" alt="'+escapeContent(image.alt)+'" width="'+mediaDimension(image.width,720)+'" height="'+mediaDimension(image.height,900)+'" loading="lazy" decoding="async"><canvas class="sequence-mesh" aria-hidden="true"></canvas></span><figcaption>COMPOSIÇÃO PROVISÓRIA / IMAGEM DO PROJETO A INSERIR</figcaption></figure><div class="sequence-copy"><h3>'+escapeContent(block.title)+'</h3>'+textContentBlock({...block,title:''})+'</div><p class="sequence-detail">A seguir / Por trás da forma.</p><div class="sequence-bottom"><span class="sequence-state">01 / IMPULSO</span><div class="sequence-track"><div class="sequence-progress"></div></div><span>ROLE PARA DESCOBRIR</span></div></div></section>';
}
function renderProjectContent(project){
 const metadata=Array.isArray(project.metadata)?project.metadata:[];
 const intro='<p class="eyebrow">'+escapeContent(project.category)+(project.provisional?' / CONTEÚDO EM PREPARAÇÃO':'')+'</p><h1>'+escapeContent(project.title)+'</h1>';
 const lead=project.lead?'<p class="lead">'+escapeContent(project.lead)+'</p>':'';
 const info=metadata.length?'<div class="metadata">'+metadata.map(item=>'<div><strong>'+escapeContent(item.label)+'</strong><p>'+escapeContent(item.value)+'</p></div>').join('')+'</div>':'';
 return '<div class="detail-inner"'+(project.about?'':' data-resonance-project="'+escapeContent(project.id)+'"')+'>'+intro+lead+info+(project.sections||[]).map((block,index)=>project.id==='experiencia'&&index===0&&block.type==='pair'&&safeAsset(block.image?.src)?representativeSequence(block):project.id==='experiencia'&&index===1?renderContentBlock(block,index,false).replace('story-pair','story-pair sequence-followup'):renderContentBlock(block,index,!project.about)).join('')+'<button class="back" data-close>Voltar à capa</button>'+(project.about?'<a class="back" href="codigo.html">Consultar o código</a>':'')+'</div>';
}
