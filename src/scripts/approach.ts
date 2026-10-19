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

// Plan to ground plates: the switch shuffles the drawing above or below the photograph.
for (const pair of document.querySelectorAll<HTMLElement>('[data-pair]')) {
  const pill = pair.querySelector<HTMLElement>('.approach-toggle-pill')!;
  const buttons = [...pair.querySelectorAll<HTMLButtonElement>('[data-show]')];
  const show = (view: string) => {
    if (pair.dataset.view === view) return;
    pair.dataset.view = view;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.show === view)));
    placePill(pill, buttons.find(button => button.dataset.show === view)!, true);
  };
  buttons.forEach(button => button.addEventListener('click', () => show(button.dataset.show!)));
  placePill(pill, buttons.find(button => button.getAttribute('aria-pressed') === 'true')!, false);
  addEventListener('resize', () => placePill(pill, buttons.find(button => button.getAttribute('aria-pressed') === 'true')!, false));
}

// The sideways row: arrows step one plate at a time; the counter and bar follow the scroll.
const track = document.querySelector<HTMLElement>('[data-plates-track]');
if (track) {
  const plates = [...track.querySelectorAll<HTMLElement>('.approach-plate')];
  const count = document.querySelector<HTMLElement>('[data-plates-count]')!;
  const bar = document.querySelector<HTMLElement>('[data-plates-bar]')!;
  const prev = document.querySelector<HTMLButtonElement>('[data-plates-prev]')!;
  const next = document.querySelector<HTMLButtonElement>('[data-plates-next]')!;
  const step = () => plates[1] ? plates[1].offsetLeft - plates[0].offsetLeft : track.clientWidth;
  const behavior = () => (mode() === 'full' ? 'smooth' : 'auto') as ScrollBehavior;
  let shown = 0;
  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    const progress = max > 0 ? track.scrollLeft / max : 0;
    const index = Math.min(plates.length - 1, Math.round(track.scrollLeft / step()));
    bar.style.transform = `scaleX(${(1 + progress * (plates.length - 1)) / plates.length})`;
    prev.disabled = track.scrollLeft <= 2; next.disabled = track.scrollLeft >= max - 2;
    if (index === shown) return;
    shown = index; count.textContent = String(index + 1).padStart(2, '0');
    spring(count, { opacity: [0, 1], y: [8, 0] });
  };
  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: behavior() }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: behavior() }));
  track.addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}

// Step story: the picture beside the steps rises into place for whichever step is
// in the middle of the screen, and a bar tracks progress through the section.
const story = document.querySelector<HTMLElement>('[data-story]');
if (story) {
  const steps = [...story.querySelectorAll<HTMLElement>('[data-story-step]')];
  const images = [...story.querySelectorAll<HTMLElement>('[data-story-image]')];
  const count = story.querySelector<HTMLElement>('[data-story-count]')!;
  const caption = story.querySelector<HTMLElement>('[data-story-caption]')!;
  const captions = images.map(image => image.querySelector('img')!.closest('figure')!.dataset.caption || '');
  let active = 0, layer = 3;
  const activate = (index: number) => {
    if (index === active) return;
    const forward = index > active; active = index;
    steps.forEach((item, i) => { item.dataset.active = String(i === index); });
    const image = images[index];
    image.style.zIndex = String(++layer);
    image.dataset.active = 'true';
    const wipe = spring(image, { clipPath: [forward ? 'inset(100% 0 0 0)' : 'inset(0 0 100% 0)', 'inset(0% 0 0% 0)'] }, { duration: 0.9, ease: [0.65, 0, 0.35, 1] });
    const settle = () => images.forEach((other, i) => { if (i !== index) other.dataset.active = 'false'; });
    if (wipe) void wipe.finished.then(() => { if (active === index) settle(); }); else settle();
    count.textContent = String(index + 1).padStart(2, '0');
    spring(count, { opacity: [0, 1], y: [forward ? 10 : -10, 0] });
    caption.textContent = captions[index];
  };
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) activate(steps.indexOf(entry.target as HTMLElement));
  }, { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(item => observer.observe(item));
  const progress = story.querySelector<HTMLElement>('[data-story-progress]')!;
  if (mode() !== 'off') scroll(animate(progress, { scaleX: [0, 1] }, { ease: 'linear' }), { target: story, offset: ['start 60%', 'end 80%'] });
}

// Finale: the round button leans toward the pointer.
const finale = document.querySelector<HTMLElement>('[data-finale-button]');
if (finale && matchMedia('(hover: hover)').matches) {
  finale.addEventListener('pointermove', event => {
    if (mode() !== 'full') return;
    const box = finale.getBoundingClientRect();
    spring(finale, { x: (event.clientX - box.left - box.width / 2) * 0.25, y: (event.clientY - box.top - box.height / 2) * 0.25 }, { type: 'spring', visualDuration: 0.35, bounce: 0.3 });
  });
  finale.addEventListener('pointerleave', () => { spring(finale, { x: 0, y: 0 }, { type: 'spring', visualDuration: 0.5, bounce: 0.45 }); });
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
