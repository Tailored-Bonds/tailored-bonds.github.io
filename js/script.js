// Bond cards carousel (outer). Works with or without dots.
(() => {
  const track = document.querySelector('.bc-track');
  if (!track) return;

  const cards = [...track.querySelectorAll('.deal-card')];
  const prev = document.querySelector('.bc-prev');
  const next = document.querySelector('.bc-next');
  const dotsWrap = document.querySelector('.bc-dots');
  const dots = dotsWrap ? [...dotsWrap.querySelectorAll('button')] : [];

  const gapPx = () => parseFloat(getComputedStyle(track).gap || 16);
  const snapW = () => (cards[0]?.getBoundingClientRect().width || 0) + gapPx();
  const visibleCount = () => Math.max(1, Math.round(track.clientWidth / snapW()));
  const clamp = (i) => Math.max(0, Math.min(i, cards.length - 1));
  const getIndex = () => clamp(Math.round(track.scrollLeft / snapW()));

  function goTo(i) {
    const t = clamp(i);
    track.scrollTo({ left: t * snapW(), behavior: 'smooth' });
    updateUI(t);
  }

  function updateUI(i = getIndex()) {
    if (dots.length) {
      dots.forEach((d, idx) => {
        const sel = idx === i;
        d.setAttribute('aria-selected', sel);
        d.tabIndex = sel ? 0 : -1;
      });
    }
    const vis = visibleCount();
    if (prev) prev.disabled = i === 0;
    if (next) next.disabled = i >= (cards.length - vis);
  }

  // Events
  prev?.addEventListener('click', () => goTo(getIndex() - 1));
  next?.addEventListener('click', () => goTo(getIndex() + 1));
  dots.forEach((d, idx) => d.addEventListener('click', () => goTo(idx)));

  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(getIndex() + 1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(getIndex() - 1); }
  });

  track.addEventListener('scroll', () => {
    if (track.__rAF) return;
    track.__rAF = requestAnimationFrame(() => { updateUI(); track.__rAF = null; });
  });

  window.addEventListener('resize', () => updateUI());
  updateUI(0);
})();
