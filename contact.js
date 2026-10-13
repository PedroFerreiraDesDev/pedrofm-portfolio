/* Envio em segundo plano: confirmação apenas após aceite do serviço. */
(()=>{
 let popup;
 function feedback(state,title,copy){
  if(!popup){
   popup=document.createElement('dialog');popup.className='contact-feedback';
   popup.setAttribute('aria-labelledby','contact-feedback-title');
   popup.innerHTML='<div class="contact-wave" aria-hidden="true"><i></i><i></i><i></i></div><div role="status" aria-live="polite"><h2 id="contact-feedback-title"></h2><p></p></div><button type="button">Continuar no projeto</button>';
   document.body.append(popup);
   popup.querySelector('button').addEventListener('click',()=>popup.close());
   popup.addEventListener('keydown',e=>e.stopPropagation());
  }
  popup.dataset.state=state;popup.querySelector('h2').textContent=title;
  popup.querySelector('p').textContent=copy;
  popup.querySelector('button').textContent=state==='sending'?'Continuar enquanto envia':'Continuar no projeto';
  if(!popup.open)popup.showModal();
 }
 document.addEventListener('change',event=>{
  const form=event.target.closest('.contact-form');if(!form)return;
  const choices=[...form.querySelectorAll('[name=interests]')];
  choices[0].setCustomValidity(choices.some(input=>input.checked)?'':'Escolha pelo menos uma opção.');
 });
 document.addEventListener('submit',async event=>{
  const form=event.target;if(!form.matches('.contact-form'))return;
  event.preventDefault();if(form.dataset.sending==='true')return;
  const choices=[...form.querySelectorAll('[name=interests]')];
  choices[0].setCustomValidity(choices.some(input=>input.checked)?'':'Escolha pelo menos uma opção.');
  if(!form.reportValidity())return;
  const data=new FormData(form);if(data.get('_honey'))return;
  const payload=Object.fromEntries(data);payload.interests=data.getAll('interests').join(', ');
  const button=form.querySelector('[type=submit]'),status=form.querySelector('[role=status]');
  form.dataset.sending='true';form.setAttribute('aria-busy','true');button.disabled=true;
  button.textContent='Enviando…';status.textContent='Enviando sua solicitação…';
  feedback('sending','Sua ideia está em movimento.','Estamos enviando sua solicitação.');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
  try{
   const response=await fetch('https://formsubmit.co/ajax/62a12ed62e8f7cb7f09c738e9239aa70',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload),signal:controller.signal});
   const result=await response.json();
   if(!response.ok||!(result.success===true||result.success==='true'))throw new Error('not-accepted');
   status.textContent='Solicitação enviada. Obrigado por compartilhar sua ideia!';
   form.reset();choices[0].setCustomValidity('');
   if(form.isConnected)feedback('success','Vamos dar forma à sua ideia.','Solicitação enviada. Obrigado pelo contato!');
  }catch(error){
   const message='Não foi possível confirmar o envio. Seus dados foram mantidos. Tente novamente ou escreva para oi@pedrofm.com.';
   status.textContent=message;if(form.isConnected)feedback('error','O sinal encontrou uma pausa.',message);
  }finally{
   clearTimeout(timer);delete form.dataset.sending;form.removeAttribute('aria-busy');button.disabled=false;button.textContent='Vamos trabalhar juntos';
  }
 });
})();
