// Mouse apenas: o celular continua usando os eventos de toque e a rolagem nativa.
function bindMouseDrag(surface, {accept, move, signal}) {
 let gesture = null, swallow = false;
 const options = {signal};
 function release() {
  if (!gesture) return;
  const {id, dragging} = gesture;
  gesture = null;
  if (dragging) {
   surface.classList.remove('is-mouse-dragging');
   if (surface.hasPointerCapture(id)) surface.releasePointerCapture(id);
  }
 }
 surface.addEventListener('pointerdown', e => {
  if (e.pointerType !== 'mouse' || !e.isPrimary || e.button !== 0) return;
  swallow = false;
  if (!accept(e.target) || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
  gesture = {id:e.pointerId, x:e.clientX, y:e.clientY, axis:null, dragging:false};
 }, options);
 window.addEventListener('pointermove', e => {
  if (!gesture || gesture.id !== e.pointerId) return;
  if (!(e.buttons & 1)) { release(); return; }
  const dx = gesture.x - e.clientX, dy = gesture.y - e.clientY;
  if (!gesture.dragging) {
   if (Math.hypot(dx,dy) < 7) return;
   gesture.axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
   gesture.dragging = swallow = true;
   surface.setPointerCapture(e.pointerId);
   surface.classList.add('is-mouse-dragging');
  }
  move(gesture.axis === 'x' ? dx : dy, gesture.axis);
  gesture.x = e.clientX; gesture.y = e.clientY;
 }, options);
 surface.addEventListener('dragstart', e => { if (gesture) e.preventDefault(); }, options);
 // Captura no documento: o mouse pode ser solto sobre um botão ou outra capa.
 document.addEventListener('click', e => {
  if (swallow && e.detail > 0 && e.pointerType !== 'touch') {
   swallow = false; e.preventDefault(); e.stopImmediatePropagation();
  }
 }, {capture:true,signal});
 // Um arrasto cancelado ou sem click não pode consumir um clique futuro.
 document.addEventListener('pointerdown', () => { swallow = false; }, {capture:true,signal});
 for (const type of ['pointerup','pointercancel','lostpointercapture']) {
  window.addEventListener(type, e => {if (gesture?.id === e.pointerId) release();}, options);
 }
 window.addEventListener('blur', release, options);
 window.addEventListener('hashchange',release,options);
 signal?.addEventListener('abort',release,{once:true});
}
