import { animate, inView } from 'motion';
import { mode } from './motion';

// Figures count up once when the strip comes into view (full motion only).
const figures = [...document.querySelectorAll<HTMLElement>('.practice-facts-strip [data-count]')];
if (figures.length && mode() === 'full') {
  inView('.practice-facts-strip', () => {
    for (const figure of figures) {
      const target = Number(figure.dataset.count);
      animate(0, target, { duration: 1.1, ease: [0.22, 1, 0.36, 1], onUpdate: value => { figure.textContent = String(Math.round(value)); } });
    }
  }, { margin: '0px 0px -10% 0px' });
}
