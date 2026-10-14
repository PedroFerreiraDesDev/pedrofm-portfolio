/* Assinatura de abertura: 300ms, independente do carregamento de arquivos. */
(()=>{
 const intro=document.getElementById('brand-intro');
 if(!intro||location.hash&&location.hash!=='#')return;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 intro.hidden=false;
 let timer=0;
 const finish=()=>{intro.hidden=true;clearTimeout(timer);window.removeEventListener('hashchange',finish);};
 // O relógio começa no primeiro frame, para a marca não sumir antes de ser pintada.
 requestAnimationFrame(()=>{
  if(intro.hidden)return;
  intro.classList.add('brand-playing');
  timer=setTimeout(finish,300);
 });
 window.addEventListener('hashchange',finish);
 window.addEventListener('pagehide',finish,{once:true});
})();
