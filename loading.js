/* Estados de espera reais: abertura, mídia, fetch e arquivos. Sem atraso artificial. */
(()=>{
 const wave='<svg class="loading-waves" viewBox="0 0 160 40" aria-hidden="true"><path d="M-8 20 Q12 0 32 20 T72 20 T112 20 T152 20 T192 20"/><path d="M-8 24 Q12 8 32 24 T72 24 T112 24 T152 24 T192 24"/><path d="M-8 16 Q12 4 32 16 T72 16 T112 16 T152 16 T192 16"/></svg>';
 const global=document.createElement('div');global.id='site-loading';global.className='loading-surface';global.hidden=true;document.body.append(global);
 const scopes=new Map();
 function begin({label='Carregando…',scope=global,retry}={}){
  let state=scopes.get(scope);
  if(!state){const panel=document.createElement('div');panel.className='loading-panel';panel.innerHTML=(scope===global?'<span class="brand-wordmark">Pedro.fm</span>':'')+wave+'<span class="loading-message" role="status" aria-live="polite"></span><button type="button" class="loading-retry" hidden>Tentar novamente</button><button type="button" class="loading-dismiss" hidden>Continuar no site</button>';scope.append(panel);state={panel,count:0,timer:0};scopes.set(scope,state);}
  const message=state.panel.querySelector('.loading-message'),button=state.panel.querySelector('.loading-retry'),dismiss=state.panel.querySelector('.loading-dismiss');
  state.count++;state.panel.hidden=true;button.hidden=true;dismiss.hidden=true;scope.classList.remove('load-failed');scope.setAttribute('aria-busy','true');
  clearTimeout(state.timer);state.timer=setTimeout(()=>{if(!state.count)return;state.panel.hidden=false;scope.classList.add('load-pending');if(scope===global)scope.hidden=false;message.textContent=label;window.dispatchEvent(new CustomEvent('pedro:loading',{detail:{active:true}}));},180);
  let closed=false;
  function finish(error){if(closed)return;closed=true;state.count=Math.max(0,state.count-1);if(state.count)return;clearTimeout(state.timer);scope.setAttribute('aria-busy','false');scope.classList.remove('load-pending');if(error){scope.classList.add('load-failed');state.panel.hidden=false;if(scope===global)scope.hidden=false;message.textContent=error;button.hidden=!retry;dismiss.hidden=scope!==global;dismiss.onclick=()=>{scope.hidden=true;scope.classList.remove('load-failed');state.panel.hidden=true;};button.onclick=()=>{state.panel.hidden=true;scope.classList.remove('load-failed');retry?.();};}else{state.panel.hidden=true;scope.classList.remove('load-failed');if(scope===global)scope.hidden=true;}}
  return {done:()=>finish(),fail:message=>finish(message||'Não foi possível carregar. Tente novamente.')};
 }
 async function run(task,options={}){const wait=begin(options);try{const result=await task();wait.done();return result;}catch(error){if(error.name==='AbortError'&&options.ignoreAbort!==false)wait.done();else wait.fail(options.error||'Não foi possível carregar. Tente novamente.');throw error;}}
 window.PedroLoading={begin,run};
 const initial=begin({label:'Sintonizando Pedro.fm…'});if(document.readyState==='complete')initial.done();else window.addEventListener('load',initial.done,{once:true});
 const records=new WeakMap(),watching=new Set();
 function prepare(media){
  if(records.has(media))return;const scope=media.closest('.story-visual');if(!scope)return;
  const record={scope,wait:null,timer:0,ready:false,failed:false};records.set(media,record);watching.add(media);
  function start(){if(record.ready||record.wait)return;record.failed=false;record.wait=begin({scope,label:media.tagName==='VIDEO'?'Carregando vídeo…':'Carregando imagem…',retry});record.timer=setTimeout(()=>failed(),25000);}
  function settled(){clearTimeout(record.timer);record.ready=true;record.failed=false;if(record.wait)record.wait.done();else if(scope.classList.contains('load-failed'))begin({scope}).done();record.wait=null;scope.classList.remove('media-failed');}
  function failed(){clearTimeout(record.timer);record.ready=false;record.failed=true;scope.classList.add('media-failed');if(!record.wait)start();record.wait?.fail('Este material não carregou. Você pode tentar novamente.');record.wait=null;}
  function retry(){record.ready=false;record.failed=false;scope.classList.remove('media-failed');start();if(media.tagName==='VIDEO'){media.preload='metadata';media.load();}else{const original=media.dataset.originalSrc||media.getAttribute('src');media.dataset.originalSrc=original;media.removeAttribute('srcset');const url=new URL(original,location.href);url.searchParams.set('retry',String(Date.now()));media.src=url.href;}}
  record.start=start;record.cancel=()=>{clearTimeout(record.timer);record.wait?.done();record.wait=null;};
  media.addEventListener(media.tagName==='VIDEO'?'loadeddata':'load',settled);media.addEventListener('error',failed);
  if(media.tagName==='VIDEO'){media.addEventListener('waiting',()=>{record.ready=false;start();});media.addEventListener('play',()=>{if(media.readyState<2){record.ready=false;start();}});media.addEventListener('loadedmetadata',()=>{if(media.paused)settled();});media.addEventListener('playing',settled);media.addEventListener('pause',()=>{if(media.readyState>=2)settled();});}
  if(media.tagName==='IMG'&&media.complete){if(media.naturalWidth)settled();else failed();}
  else if(media.tagName==='VIDEO'&&media.readyState>=2)settled();
  else if(observer)observer.observe(media);else if(media.tagName==='IMG')start();
 }
 const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>entries.forEach(entry=>{const record=records.get(entry.target);if(entry.isIntersecting&&(entry.target.tagName==='IMG'||entry.target.preload!=='none'))record?.start();}),{rootMargin:'120px'}):null;
 function scan(){document.querySelectorAll('.story-visual img,.story-visual video').forEach(prepare);watching.forEach(media=>{if(!media.isConnected){records.get(media)?.cancel();observer?.unobserve(media);watching.delete(media);}});scopes.forEach((state,scope)=>{if(!scope.isConnected){clearTimeout(state.timer);scopes.delete(scope);}});}
 new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});scan();
 document.addEventListener('click',async event=>{const link=event.target.closest('a[data-download]');if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();if(link.getAttribute('aria-disabled')==='true')return;const original=link.textContent;link.setAttribute('aria-disabled','true');const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),25000);try{await run(async()=>{const response=await fetch(link.href,{signal:controller.signal});if(!response.ok)throw Error();const blob=await response.blob(),url=URL.createObjectURL(blob),download=document.createElement('a');download.href=url;download.download=link.getAttribute('download')||link.href.split('/').pop();document.body.append(download);download.click();download.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);},{label:'Preparando arquivo…',ignoreAbort:false,retry:()=>link.click(),error:'O arquivo não carregou. Tente novamente.'});}catch{link.textContent='Tentar baixar novamente';}finally{clearTimeout(timeout);link.setAttribute('aria-disabled','false');if(link.textContent!=='Tentar baixar novamente')link.textContent=original;}});
})();
