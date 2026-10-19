import { animate, scroll } from 'motion';
import { mode, root, setupImageErrors } from './motion';
import { arrive, revealOnView, spring, structure } from './spring';

root.dataset.enhanced = 'true';
setupImageErrors();
revealOnView();

// Plan / Built switches: the pill slides behind the chosen button.
const placePill = (pill: HTMLElement, button: HTMLButtonElement, animated: boolean) => {
  const keyframes = { x: button.offsetLeft - 3, width: button.offsetWidth };
  if (!animated || !spring(pill, keyframes, { type: 'spring', visualDuration: 0.3, bounce: 0.15 })) {
    pill.style.transform = `translateX(${keyframes.x}px)`; pill.style.width = keyframes.width + 'px';
  }
};

// Hero: Crestmont West's plan, then its built courtyard rising from a ground line.
const hero = document.querySelector<HTMLElement>('#hero');
if (hero) {
  const built = hero.querySelector<HTMLElement>('.approach-hero-built')!;
  const ground = hero.querySelector<HTMLElement>('.approach-hero-ground')!;
  const caption = hero.querySelector<HTMLElement>('[data-hero-caption]')!;
  const pill = hero.querySelector<HTMLElement>('.approach-toggle-pill')!;
  const buttons = [...hero.querySelectorAll<HTMLButtonElement>('[data-hero-show]')];
  const captions: Record<string, string> = { plan: 'Landscape plan · Crestmont West', built: 'Built courtyard · Crestmont West' };
  let request = 0;
  const show = async (view: string, animated = true) => {
    const ticket = ++request;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.heroShow === view)));
    placePill(pill, buttons.find(button => button.dataset.heroShow === view)!, animated);
    caption.textContent = captions[view];
    spring(caption, { opacity: [0, 1], y: [view === 'built' ? 10 : -10, 0] });
    const rising = view === 'built';
    if (rising) hero.dataset.heroView = 'built';
    const reveal = animated && mode() === 'full' && animate(built, { clipPath: rising ? ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'] : ['inset(0% 0 0 0)', 'inset(100% 0 0 0)'] }, { duration: rising ? 1.6 : 1.1, ease: [0.65, 0, 0.35, 1] });
    if (reveal) {
      animate(ground, { top: rising ? ['100%', '0%'] : ['0%', '100%'], opacity: [0, 1, 1, 0] }, { duration: rising ? 1.6 : 1.1, ease: [0.65, 0, 0.35, 1] });
      await reveal.finished.catch(() => {});
    }
    if (ticket !== request) return;
    built.style.clipPath = '';
    hero.dataset.heroView = view;
  };
  buttons.forEach(button => button.addEventListener('click', () => {
    if (button.getAttribute('aria-pressed') === 'true') return;
    void show(button.dataset.heroShow!);
  }));
  const current = () => buttons.find(button => button.getAttribute('aria-pressed') === 'true')!;
  placePill(pill, current(), false);
  addEventListener('resize', () => placePill(pill, current(), false));

  if (hero.dataset.heroView === 'plan') {
    // Opening sequence: headline lines and step cards settle, then the courtyard rises.
    placePill(pill, buttons[0], false);
    buttons[0].setAttribute('aria-pressed', 'true'); buttons[1].setAttribute('aria-pressed', 'false');
    caption.textContent = captions.plan;
    arrive([...hero.querySelectorAll('h1 span'), ...hero.querySelectorAll('.approach-hero-foot > *')], 28);
    spring([...document.querySelectorAll('.approach-steps li')], { opacity: [0, 1], y: [56, 0] }, { ...structure, visualDuration: 0.5, delay: (i: number) => 0.35 + i * 0.08 });
    setTimeout(() => { if (hero.dataset.heroView === 'plan') void show('built'); }, 900);
    // A gentle drift of the pictures as the hero scrolls away.
    scroll(animate(hero.querySelectorAll('.approach-hero-plan, .approach-hero-built img'), { y: [0, 90], scale: [1.04, 1.1] }, { ease: 'linear' }), { target: hero, offset: ['start start', 'end start'] });
  }
}

for (const pair of document.querySelectorAll<HTMLElement>('[data-pair]')) {
  const pill = pair.querySelector<HTMLElement>('.approach-toggle-pill')!;
  const buttons = [...pair.querySelectorAll<HTMLButtonElement>('[data-show]')];
  const show = (view: string) => {
    if (pair.dataset.view === view) return;
    pair.dataset.view = view;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.show === view)));
    placePill(pill, buttons.find(button => button.dataset.show === view)!, true);
    const layer = pair.querySelector(`[data-layer="${view}"]`)!;
    spring(layer, { opacity: [0, 1], scale: [1.03, 1], filter: ['blur(4px)', 'blur(0px)'] }, structure);
  };
  buttons.forEach(button => button.addEventListener('click', () => show(button.dataset.show!)));
  placePill(pill, buttons.find(button => button.getAttribute('aria-pressed') === 'true')!, false);
  addEventListener('resize', () => placePill(pill, buttons.find(button => button.getAttribute('aria-pressed') === 'true')!, false));
}

// Questions open and close with a height spring instead of a jump.
for (const question of document.querySelectorAll<HTMLDetailsElement>('.approach-question')) {
  const answer = question.querySelector<HTMLElement>('.approach-answer')!;
  question.querySelector('summary')!.addEventListener('click', event => {
    event.preventDefault();
    if (!question.open) {
      question.open = true;
      void spring(answer, { height: [0, answer.scrollHeight], opacity: [0, 1] }, structure)?.finished.then(() => { answer.style.height = ''; });
      return;
    }
    const closing = spring(answer, { height: [answer.offsetHeight, 0], opacity: [1, 0] }, structure);
    if (!closing) { question.open = false; return; }
    void closing.finished.then(() => { question.open = false; answer.style.height = ''; answer.style.opacity = ''; });
  });
}
