/* Preferência do visitante separada do estado real do navegador e da aba. */
window.createPedroSoundControls=function(toggle,options={}){
 const load=options.load||(()=>import('./audio.js'));
 const label=document.getElementById('sound-label');
 let wanted=true,context=null,engine=null,loading=false,active=false,failed=false;
 let present=!document.hidden&&(document.hasFocus?.()??true);
 try{wanted=localStorage.getItem('pedrofm.sound')!=='off';}catch{}
 function render(){
  const playing=active&&context?.state==='running'&&present;
  toggle.setAttribute('aria-pressed',String(playing));
  toggle.setAttribute('aria-busy',String(loading));
  label.textContent=failed?'Som: tentar novamente':!wanted?'Som: pausado':!present?'Som: em espera':playing?'Som: ligado':loading?'Som: carregando':'Som: toque para ouvir';
  toggle.setAttribute('aria-label',playing?'Pausar som':!wanted?'Retomar som':'Ativar som');
 }
 function reconcile(){
  const on=!!(wanted&&present&&!document.hidden&&engine&&context?.state==='running');
  engine?.setScene(location.hash.startsWith('#projeto/'));
  if(active!==on){active=on;engine?.setEnabled(on).catch(()=>{active=false;failed=true;render();});}
  if((!wanted||!present||document.hidden)&&context?.state==='running')context.suspend().catch(()=>{});
  render();
 }
 function start(){
  if(!wanted||!present||document.hidden)return;
  try{
   if(!context){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error('unsupported');context=new Audio();context.addEventListener('statechange',reconcile);}
   // resume acontece na própria interação; não espera pelo download do módulo.
   context.resume().then(reconcile).catch(()=>{render();});
   if(!engine&&!loading){loading=true;failed=false;load().then(module=>{engine=module.createSonicWind(context);loading=false;reconcile();}).catch(()=>{loading=false;failed=true;render();});}
   reconcile();
  }catch{failed=true;render();}
 }
 toggle.addEventListener('click',event=>{
  event.stopPropagation();
  wanted=!(wanted&&active&&context?.state==='running');
  try{localStorage.setItem('pedrofm.sound',wanted?'on':'off');}catch{}
  if(wanted)start();else reconcile();
 });
 function gesture(event){if(event.target.closest?.('.sound-dock'))return;if(wanted&&context?.state!=='running')start();}
 document.addEventListener('pointerdown',gesture,{passive:true});
 document.addEventListener('keydown',gesture);
 function presence(value){present=value&&!document.hidden;if(present)start();else reconcile();}
 document.addEventListener('visibilitychange',()=>presence(!document.hidden&&(document.hasFocus?.()??true)));
 window.addEventListener('blur',()=>presence(false));
 window.addEventListener('focus',()=>presence(true));
 window.addEventListener('pagehide',()=>presence(false));
 window.addEventListener('pageshow',()=>presence(!document.hidden));
 window.addEventListener('hashchange',()=>engine?.setScene(location.hash.startsWith('#projeto/')));
 start();render();
 return {setScene:inside=>engine?.setScene(inside),playClick:kind=>{if(active)engine?.playClick(kind);},modulate:(e,x)=>{if(active)engine?.modulate(e,x);},isActive:()=>active};
};
