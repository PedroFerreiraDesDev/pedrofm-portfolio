/* Índice visual: navegação explícita, sem converter a roda vertical em horizontal. */
(()=>{
 const gallery=document.getElementById('gallery');
 if(!gallery)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 document.addEventListener('click',event=>{
  const step=event.target.closest('[data-gallery-step]');
  if(step){
   const rail=step.closest('.project-visual-index').querySelector('.project-gallery-rail');
   rail.scrollBy({left:Number(step.dataset.galleryStep)*rail.clientWidth*.8,behavior:reduced.matches?'auto':'smooth'});return;
  }
  const card=event.target.closest('[data-project-chapter]');
  if(!card)return;
  const root=card.closest('.experience-flow');
  const target=[...root.querySelectorAll('.project-chapter')].find(node=>node.dataset.chapter===card.dataset.projectChapter);
  if(!target)return;
  gallery.scrollTo({top:gallery.scrollTop+target.getBoundingClientRect().top-gallery.getBoundingClientRect().top-32,behavior:reduced.matches?'auto':'smooth'});
  target.focus({preventScroll:true});
 });
 document.addEventListener('keydown',event=>{
  if(!event.target.closest('.project-gallery-rail'))return;
  if(!['ArrowLeft','ArrowRight'].includes(event.key))return;
  event.preventDefault();event.stopPropagation();
  const rail=event.target.closest('.project-gallery-rail');
  const cards=[...rail.querySelectorAll('.project-gallery-card')],index=cards.indexOf(document.activeElement);
  const next=Math.max(0,Math.min(cards.length-1,index+(event.key==='ArrowRight'?1:-1)));
  cards[next]?.focus({preventScroll:true});
  const card=cards[next];if(card)rail.scrollTo({left:rail.scrollLeft+card.getBoundingClientRect().left-rail.getBoundingClientRect().left,behavior:reduced.matches?'auto':'smooth'});
 });
})();
