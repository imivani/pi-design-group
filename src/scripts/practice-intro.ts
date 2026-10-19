import { animate, inView, scroll } from 'motion';
import { mode, root } from './motion';
import { spring } from './spring';

const section = document.querySelector<HTMLElement>('#about.practice-intro');
if (section) {
  root.dataset.enhanced = 'true';
  const full = mode() === 'full';

  // The statement fills in word by word as it scrolls through the screen.
  const statement = section.querySelector<HTMLElement>('[data-practice-statement]')!;
  const words = [...statement.querySelectorAll<HTMLElement>('span')];
  if (full) {
    scroll(progress => {
      const lit = Math.round(progress * words.length * 1.15);
      words.forEach((word, index) => word.toggleAttribute('data-lit', index < lit));
    }, { target: statement, offset: ['start 85%', 'end 45%'] });
  }

  // The photograph drifts inside its frame; the pill in the title opens out.
  const photo = section.querySelector<HTMLElement>('[data-practice-photo] img');
  if (photo && full) scroll(animate(photo, { y: ['-9%', '0%'] }, { ease: 'linear' }), { target: photo.parentElement!, offset: ['start end', 'end start'] });
  const pill = section.querySelector<HTMLElement>('.practice-title-photo');
  if (pill && full) inView(pill, () => { spring(pill, { clipPath: ['inset(0 50% 0 50% round 999px)', 'inset(0 0% 0 0% round 999px)'] }, { type: 'spring', visualDuration: 0.8, bounce: 0.1 }); }, { margin: '0px 0px -15% 0px' });

  // Figures: rules draw across and the numbers count up once.
  const strip = section.querySelector<HTMLElement>('.practice-facts-strip')!;
  const cells = [...strip.children] as HTMLElement[];
  const figures = [...strip.querySelectorAll<HTMLElement>('[data-count]')];
  if (full && strip.getBoundingClientRect().top > innerHeight) {
    cells.forEach(cell => cell.style.setProperty('--line-progress', '0'));
    inView(strip, () => {
      cells.forEach((cell, index) => setTimeout(() => cell.style.setProperty('--line-progress', '1'), index * 120));
      for (const figure of figures) {
        const target = Number(figure.dataset.count);
        animate(0, target, { duration: 1.2, ease: [0.22, 1, 0.36, 1], onUpdate: value => { figure.textContent = String(Math.round(value)); } });
      }
    }, { margin: '0px 0px -10% 0px' });
  }
}
