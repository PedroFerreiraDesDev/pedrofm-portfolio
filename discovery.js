/* Configuração da ressonância. O movimento pertence ao RAF único de story.js. */
(()=>{
 const details=document.getElementById('case');if(!details)return;
 const defaults={amplitude:30,depth:90,frequency:3,intensity:.65};
 let configuration=null,observer=null,generation=0;
 const bounded=(value,fallback,min,max)=>Number.isFinite(Number(value))?Math.max(min,Math.min(max,Number(value))):fallback;
 function load(){
  if(!configuration){
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
   configuration=fetch('interacoes.json',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{if(data.version!==1)throw Error('Versão inválida');return data;}).catch(error=>{configuration=null;throw error;}).finally(()=>clearTimeout(timer));
  }
  return configuration;
 }
 function notify(settings){window.PedroResonance=settings;window.dispatchEvent(new Event('resonancechange'));}
 function mount(){
  const own=++generation;observer?.disconnect();
  const inner=details.querySelector('[data-resonance-project]');notify({...defaults,enabled:!!inner});
  if(!inner)return;
  let started=false;
  async function initialize(){
   if(started)return;started=true;
   const wait=window.PedroLoading?.begin({scope:inner,label:'Sintonizando movimento…',retry:()=>{started=false;initialize();}});
   try{
    const data=await load();if(own!==generation||!inner.isConnected){wait?.done();return;}
    const s={...data.defaults,...data.projects?.[inner.dataset.resonanceProject]};
    notify({enabled:true,amplitude:bounded(s.amplitude,30,0,60),depth:bounded(s.depth,90,0,150),frequency:bounded(s.frequency,3,1,8),intensity:bounded(s.intensity,.65,0,1)});wait?.done();
   }catch{if(own===generation)wait?.fail('A sintonia personalizada não carregou. O movimento padrão continua disponível.');else wait?.done();}
  }
  if('IntersectionObserver' in window){observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();initialize();}},{root:document.getElementById('gallery'),rootMargin:'120px'});observer.observe(inner);}else initialize();
 }
 window.addEventListener('hashchange',mount);mount();
})();
