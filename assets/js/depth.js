/* depth.js — pointer spotlight for the instrument-panel background.
   rAF-throttled pointermove → CSS custom properties on .pointer-halo.
   No loops, no libraries; disabled on touch and reduced motion. */
(function () {
  var halo = document.querySelector('.pointer-halo');
  if (!halo) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var queued = false, px = 0, py = 0, shown = false;

  window.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    px = e.clientX;
    py = e.clientY;
    if (!shown) { halo.classList.add('is-on'); shown = true; }
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      halo.style.setProperty('--x', px + 'px');
      halo.style.setProperty('--y', py + 'px');
      queued = false;
    });
  }, { passive: true });

  document.addEventListener('pointerleave', function () {
    halo.classList.remove('is-on');
    shown = false;
  });
})();
