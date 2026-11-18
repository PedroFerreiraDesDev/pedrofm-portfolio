// Uma unidade inteira de posição equivale à largura de uma capa.
function coverMotion({width, reduced, paint, arrive, raf, cancel}) {
  let position = 0, target = 0, frame = 0, previous = 0, settling = false;
  const clamp = n => Math.max(-1, Math.min(1, n));
  function schedule() {
    if (!frame) frame = raf(tick);
  }
  function tick(time) {
    frame = 0;
    const dt = Math.min(48, previous ? time - previous : 16);
    previous = time;
    const gap = target - position;
    const step = gap * (1 - Math.exp(-dt / 105));
    const limit = dt / 1550;
    position += Math.sign(step) * Math.min(Math.abs(step), limit);
    if (Math.abs(target - position) < .001) position = target;
    if (!reduced() || Math.abs(position) === 1) paint(position);
    if (Math.abs(position) === 1) {
      previous = 0;
      arrive(Math.sign(position));
      return;
    }
    if (position !== target) schedule();
    else previous = 0;
  }
  function feed(pixels, touch = false) {
    if (!pixels) return;
    if (settling && Math.sign(pixels) === Math.sign(target)) return;
    // Uma inversão da roda descarta o avanço que ainda não chegou à tela.
    if (settling || (!touch && (target-position)*pixels < 0)) target = position;
    settling = false;
    const path = touch ? Math.max(300, Math.min(width() * 1.15, 650))
                       : Math.max(1050, Math.min(width() * 1.55, 1950));
    target = clamp(target + pixels / path);
    if (Math.abs(target) >= .80 && Math.sign(pixels) === Math.sign(target)) select(Math.sign(target));
    else schedule();
  }
  function select(direction) {
    settling = true;
    target = Math.sign(direction);
    if (reduced()) { position = target; arrive(target); }
    else schedule();
  }
  function reset() {
    cancel(frame);
    frame = previous = position = target = 0;
    settling = false;
  }
  return {feed, select, reset};
}
