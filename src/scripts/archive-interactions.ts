const archive = document.querySelector<HTMLElement>('#project-collection');
const cards = [...(archive?.querySelectorAll<HTMLAnchorElement>('.project-link') || [])];
const finePointer = matchMedia('(hover:hover) and (pointer:fine)');
const pending = new Map<HTMLAnchorElement, ReturnType<typeof setTimeout>>();
const information = cards.map(card => card.querySelector<HTMLElement>('.project-information')!).filter(Boolean);
const measure = (element: HTMLElement, height = element.getBoundingClientRect().height) => {
  if (height > 0) element.closest<HTMLElement>('.project-link')?.style.setProperty('--project-info-height', `${height}px`);
};
const sizeObserver = new ResizeObserver(entries => entries.forEach(entry => measure(entry.target as HTMLElement, entry.borderBoxSize[0]?.blockSize)));
information.forEach(element => { measure(element); sizeObserver.observe(element); });

const cancel = (card: HTMLAnchorElement) => {
  const timer = pending.get(card);
  if (timer) clearTimeout(timer);
  pending.delete(card);
};
const close = (card: HTMLAnchorElement) => {
  cancel(card);
  card.removeAttribute('data-details-open');
};

// A short pointer pause makes browsing feel deliberate. Nothing intercepts the
// project link: keyboard and touch visitors can always open it directly.
cards.forEach(card => {
  card.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse' || !finePointer.matches) return;
    cancel(card);
    pending.set(card, setTimeout(() => {
      pending.delete(card);
      card.dataset.detailsOpen = 'true';
    }, 140));
  });
  card.addEventListener('pointerleave', () => close(card));
  card.addEventListener('blur', () => { if (!card.matches(':hover')) close(card); });
});
const settle = () => cards.forEach(close);
finePointer.addEventListener('change', settle);
window.addEventListener('pagehide', () => { settle(); sizeObserver.disconnect(); });
window.addEventListener('pageshow', () => { settle(); information.forEach(element => { measure(element); sizeObserver.observe(element); }); });
archive?.setAttribute('data-archive-ready', 'true');

export {};
