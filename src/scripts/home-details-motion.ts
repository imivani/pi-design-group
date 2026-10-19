import { animate } from 'motion';
import { mode } from './motion';
import { spring } from './spring';

// Visual layer for the details section; selection itself lives in home-details.ts.
const section = document.querySelector<HTMLElement>('#why[data-detail-active]');
const data = document.querySelector<HTMLScriptElement>('#home-details-data');
if (section && data) {
  const details = JSON.parse(data.textContent || '[]') as { id: string; project: string; photo: string }[];
  const print = section.querySelector<HTMLElement>('.detail-print')!;
  const printImage = section.querySelector<HTMLImageElement>('[data-detail-print]')!;
  const printCaption = section.querySelector<HTMLElement>('[data-detail-print-caption]')!;
  const counter = section.querySelector<HTMLElement>('#detail-plan-counter')!;
  const title = section.querySelector<HTMLElement>('#detail-plan-title')!;
  let shown = section.dataset.detailActive;

  // A new print lands on the drawing; the previous one slides off the table.
  new MutationObserver(() => {
    const id = section.dataset.detailActive;
    if (id === shown) return;
    const forward = details.findIndex(item => item.id === id) > details.findIndex(item => item.id === shown);
    shown = id;
    const detail = details.find(item => item.id === id)!;
    if (mode() === 'full') {
      const old = print.cloneNode(true) as HTMLElement;
      old.style.zIndex = '5';
      print.after(old);
      void animate(old, { x: forward ? [0, -60] : [0, 60], y: [0, 40], rotate: [3, forward ? -8 : 12], opacity: [1, 0] }, { duration: 0.5, ease: [0.4, 0, 1, 1] }).finished.then(() => old.remove());
      printImage.src = detail.photo;
      spring(print, { y: [70, 0], rotate: [forward ? 10 : -6, 3], opacity: [0, 1] }, { type: 'spring', visualDuration: 0.55, bounce: 0.25 });
    } else {
      printImage.src = detail.photo;
    }
    printCaption.textContent = 'Built · ' + detail.project;
    spring([counter, title], { opacity: [0, 1], y: [forward ? 16 : -16, 0] });
  }).observe(section, { attributes: true, attributeFilter: ['data-detail-active'] });

  // Loupe: a round magnifier follows the pointer across the drawing.
  const link = section.querySelector<HTMLElement>('.detail-plan-link')!;
  const plan = section.querySelector<HTMLImageElement>('#detail-plan-image')!;
  const loupe = section.querySelector<HTMLElement>('.detail-loupe')!;
  const zoom = 2.6;
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    link.addEventListener('pointermove', event => {
      if (!plan.naturalWidth) return;
      const box = link.getBoundingClientRect();
      const pad = parseFloat(getComputedStyle(plan).paddingLeft) || 0;
      const frameWidth = box.width - pad * 2, frameHeight = box.height - pad * 2;
      const scale = Math.min(frameWidth / plan.naturalWidth, frameHeight / plan.naturalHeight);
      const width = plan.naturalWidth * scale, height = plan.naturalHeight * scale;
      const left = pad + (frameWidth - width) / 2, top = pad + (frameHeight - height) / 2;
      const x = event.clientX - box.left, y = event.clientY - box.top;
      const inside = x > left && x < left + width && y > top && y < top + height;
      link.dataset.loupe = inside ? 'on' : 'off';
      if (!inside) return;
      const radius = loupe.offsetWidth / 2;
      loupe.style.left = x + 'px'; loupe.style.top = y + 'px';
      loupe.style.backgroundImage = `url("${plan.currentSrc || plan.src}")`;
      loupe.style.backgroundSize = `${width * zoom}px ${height * zoom}px`;
      loupe.style.backgroundPosition = `${radius - (x - left) * zoom}px ${radius - (y - top) * zoom}px`;
    });
    link.addEventListener('pointerleave', () => { link.dataset.loupe = 'off'; });
  }
}
