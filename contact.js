/* POST nativo: a confirmação só aparece após retorno do serviço de envio. */
(()=>{
 document.addEventListener('submit',event=>{
  const form=event.target;if(!form.matches('.contact-form'))return;
  const button=form.querySelector('[type=submit]'),status=form.querySelector('[role=status]');
  if(form.dataset.sending==='true'){event.preventDefault();return;}
  if(!form.reportValidity()){event.preventDefault();return;}
  form.dataset.sending='true';button.disabled=true;
  button.textContent='Continuar envio…';
  status.textContent='Você será encaminhado para a verificação de segurança do envio.';
  // Se a navegação falhar, mantém os dados e permite uma nova tentativa.
  setTimeout(()=>{if(form.isConnected){delete form.dataset.sending;button.disabled=false;button.textContent='Vamos trabalhar juntos';status.textContent='Se a verificação não abriu, tente novamente ou escreva para oi@pedrofm.com.';}},15000);
 });
 window.addEventListener('pageshow',()=>{
  document.querySelectorAll('.contact-form').forEach(form=>{delete form.dataset.sending;const button=form.querySelector('[type=submit]');button.disabled=false;button.textContent='Vamos trabalhar juntos';form.querySelector('[role=status]').textContent='Envio protegido por verificação de segurança.';});
 });
})();
