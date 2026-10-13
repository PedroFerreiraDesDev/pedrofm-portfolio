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

function representativeSequence(block,project={}){
 const lines=Array.isArray(project.sequenceTitle)&&project.sequenceTitle.length===2?project.sequenceTitle:["O invisível","move a forma."];
 const letters=text=>[...text].map(char=>'<span class="sequence-glyph" aria-hidden="true"><span class="sequence-letter">'+(char===' '?'&nbsp;':escapeContent(char))+'</span></span>').join('');
 const image=block.image||{};
 return '<section class="wind-sequence" aria-label="Estudo de movimento: impulso, forma e passagem"><div class="sequence-stage"><canvas class="sequence-membrane" aria-hidden="true"></canvas><div class="sequence-fallback" aria-hidden="true"></div><div class="sequence-topline"><span>PEDRO.FM / ESTUDO DE MOVIMENTO</span><button class="sequence-skip" type="button">Pular sequência ↓</button></div><h2 class="sequence-title" aria-label="'+escapeContent(lines.join(' '))+'"><span class="sequence-title-line">'+letters(lines[0])+'</span><em class="sequence-title-line">'+letters(lines[1])+'</em></h2><figure class="sequence-image"><span class="sequence-paper"><img src="'+escapeContent(image.src)+'" alt="'+escapeContent(image.alt)+'" width="'+mediaDimension(image.width,720)+'" height="'+mediaDimension(image.height,900)+'" loading="lazy" decoding="async"><canvas class="sequence-mesh" aria-hidden="true"></canvas></span><figcaption>COMPOSIÇÃO PROVISÓRIA / IMAGEM DO PROJETO A INSERIR</figcaption></figure><div class="sequence-copy"><h3>'+escapeContent(block.title)+'</h3>'+textContentBlock({...block,title:'',pending:false})+'</div><div class="sequence-bottom"><span class="sequence-state">01 / IMPULSO</span><div class="sequence-track"><div class="sequence-progress"></div></div><span>ROLE PARA DESCOBRIR</span></div></div></section>';
}
function flowLetters(text){return String(text).split(' ').map(word=>'<span class="flow-word">'+[...word].map(char=>'<span class="sequence-glyph" aria-hidden="true"><span class="sequence-letter">'+escapeContent(char)+'</span></span>').join('')+'</span>').join(' ');}
function flowImage(image){if(!image||!safeAsset(image.src))return '';return '<figure class="flow-picture"><span class="sequence-paper"><img src="'+escapeContent(image.src)+'" alt="'+escapeContent(image.alt||'Imagem do estudo')+'" width="'+mediaDimension(image.width,1200)+'" height="'+mediaDimension(image.height,900)+'" loading="lazy" decoding="async"><canvas class="sequence-mesh" aria-hidden="true"></canvas></span><figcaption>'+escapeContent(image.caption||'Material provisório')+'</figcaption></figure>';}

function projectContact(project){
 const id='contact-'+String(project.id).replace(/[^a-z0-9-]/gi,'');
 const interests=['Redes sociais','Branding','Identidade visual','Editorial','Cartazes e peças gráficas','Vídeos e motion','Endomarketing','Outro / preciso de orientação'].map(label=>'<label class="contact-choice"><input type="checkbox" name="interests" value="'+escapeContent(label)+'"><span>'+escapeContent(label)+'</span></label>').join('');
 return '<section class="project-contact" aria-labelledby="'+id+'-title"><div><p class="contact-kicker">VAMOS TRABALHAR JUNTOS</p><h2 id="'+id+'-title">Seu próximo projeto começa com uma conversa.</h2><p>Precisa de design, branding ou direção criativa? Conte o que você tem em mente e vamos conversar sobre como posso ajudar a transformar sua ideia em projeto.</p></div><form class="contact-form" aria-describedby="'+id+'-status" action="https://formsubmit.co/oi@pedrofm.com" method="POST"><input type="hidden" name="_subject" value="Pedro.fm — Nova solicitação de projeto"><input type="hidden" name="_template" value="table"><input type="text" name="_honey" tabindex="-1" autocomplete="off" class="contact-honey" aria-hidden="true"><input type="hidden" name="_captcha" value="false"><input type="hidden" name="project_title" value="'+escapeContent(project.title)+'"><input type="hidden" name="project" value="'+escapeContent(project.id)+'"><fieldset class="contact-interests"><legend>O que vamos criar?</legend><p class="contact-hint">Escolha uma ou mais opções.</p><div class="contact-choices">'+interests+'</div></fieldset><label class="contact-field">Nome<input name="name" autocomplete="name" required maxlength="120"></label><label class="contact-field">E-mail<input name="email" type="email" autocomplete="email" required maxlength="254"></label><label class="contact-field">Empresa ou marca <small>Opcional</small><input name="company" autocomplete="organization" maxlength="160"></label><label class="contact-field">Qual é o desafio?<textarea name="message" required maxlength="5000" rows="4" placeholder="O que você quer comunicar ou transformar? Se já tiver um prazo, conte aqui."></textarea></label><button class="contact-submit" type="submit">Vamos trabalhar juntos</button><p class="contact-privacy">Seus dados serão enviados pelo FormSubmit para responder à sua solicitação. Prefere e-mail? <a href="mailto:oi@pedrofm.com">oi@pedrofm.com</a></p><p class="contact-status" id="'+id+'-status" role="status">Sua solicitação será enviada sem sair desta página.</p></form></section>';
}

function projectCasePage(project){
 const projects=typeof portfolioData!=='undefined'?portfolioData.projects.filter(p=>!p.about):[];
 const position=projects.findIndex(p=>p.id===project.id),next=position>=0&&projects.length>1?projects[(position+1)%projects.length]:null;
 const nextName=next?String(next.word||next.category||next.title).replace(/\s+/g,'').replace(/\.$/,''):'';
 const nextLink=next?'<a class="case-nav-next" href="#projeto/'+escapeContent(next.id)+'"><span class="case-nav-label">Próximo projeto</span><strong>'+escapeContent(nextName)+'</strong><span class="case-nav-arrow" aria-hidden="true">→</span></a>':'';
 const sections=project.sections||[];
 const blocks=sections.map((block,index)=>{
  if(index===0&&block.type==='pair'&&safeAsset(block.image?.src))return representativeSequence(block,project);
  const heading=block.title?'<h2 class="flow-heading" aria-label="'+escapeContent(block.title)+'">'+flowLetters(block.title)+'</h2>':'';
  const copy='<div class="flow-copy">'+heading+textContentBlock({...block,title:'',pending:false})+'</div>';
  if(block.type==='pair')return '<section class="flow-row '+(block.imageSide==='left'?'flow-reverse':'')+'">'+copy+flowImage(block.image)+'</section>';
  if(block.type==='image')return '<section class="flow-row flow-wide">'+flowImage(block.image)+'</section>';
  if(block.type==='text')return '<section class="flow-row flow-text">'+copy+'</section>';
  return '<section class="flow-row">'+renderContentBlock(block,index,false)+'</section>';
 }).join('');
 return '<div class="detail-inner experience-flow" data-resonance-project="'+escapeContent(project.id)+'"><div class="flow-atmosphere" aria-hidden="true"><canvas></canvas><div class="sequence-fallback"></div></div><div class="flow-content"><div class="flow-intro"><p class="eyebrow">'+escapeContent(project.category)+(project.provisional?' / ESTUDO EM PREPARAÇÃO':'')+'</p><h1 class="flow-heading" aria-label="'+escapeContent(project.title)+'">'+flowLetters(project.title)+'</h1><p class="lead">'+escapeContent(project.lead)+'</p><div class="metadata">'+(project.metadata||[]).map(item=>'<div><strong>'+escapeContent(item.label)+'</strong><p>'+escapeContent(item.value)+'</p></div>').join('')+'</div></div>'+blocks+projectContact(project)+'<nav class="flow-end case-navigation" aria-label="Navegação entre projetos"><button class="case-nav-back" data-close type="button"><span aria-hidden="true">↑</span> Voltar à capa</button>'+nextLink+'</nav></div></div>';
}
function renderProjectContent(project){
 if(!project.about)return projectCasePage(project);
 const metadata=Array.isArray(project.metadata)?project.metadata:[];
 const intro='<p class="eyebrow">'+escapeContent(project.category)+(project.provisional?' / CONTEÚDO EM PREPARAÇÃO':'')+'</p><h1>'+escapeContent(project.title)+'</h1>';
 const lead=project.lead?'<p class="lead">'+escapeContent(project.lead)+'</p>':'';
 const info=metadata.length?'<div class="metadata">'+metadata.map(item=>'<div><strong>'+escapeContent(item.label)+'</strong><p>'+escapeContent(item.value)+'</p></div>').join('')+'</div>':'';
 return '<div class="detail-inner"'+(project.about?'':' data-resonance-project="'+escapeContent(project.id)+'"')+'>'+intro+lead+info+(project.sections||[]).map((block,index)=>renderContentBlock(block,index,false)).join('')+'<button class="back" data-close>Voltar à capa</button>'+(project.about?'<a class="back" href="codigo.html">Consultar o código</a>':'')+'</div>';
}
