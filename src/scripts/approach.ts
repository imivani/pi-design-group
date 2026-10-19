import { animate, scroll } from 'motion';
import { mode, root, setupImageErrors } from './motion';
import { revealOnView, spring, structure } from './spring';

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
  let opening: ReturnType<typeof setTimeout> | undefined;
  buttons.forEach(button => button.addEventListener('click', () => {
    clearTimeout(opening); // a visitor's choice replaces the opening sequence
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
    // The headline, switch and step cards rise in with the page entrance (page-entrance.css).
    opening = setTimeout(() => { if (hero.dataset.heroView === 'plan') void show('built'); }, 1300);
    // A gentle drift of the pictures as the hero scrolls away.
    scroll(animate(hero.querySelectorAll('.approach-hero-plan, .approach-hero-built img'), { y: [0, 90], scale: [1.04, 1.1] }, { ease: 'linear' }), { target: hero, offset: ['start start', 'end start'] });
  }
}

// Plan to ground: the built photograph covers the plan up to a draggable divider.
// Plan and Built glide the divider to either end; tabs switch between projects.
const compare = document.querySelector<HTMLElement>('[data-compare]');
if (compare) {
  const stages = [...compare.querySelectorAll<HTMLElement>('[data-compare-stage]')];
  const tabs = [...compare.querySelectorAll<HTMLButtonElement>('[data-compare-tab]')];
  for (const stage of stages) {
    const slider = stage.querySelector<HTMLElement>('[data-slider]')!;
    const range = slider.querySelector<HTMLInputElement>('input')!;
    const pill = stage.querySelector<HTMLElement>('.approach-toggle-pill')!;
    const buttons = [...stage.querySelectorAll<HTMLButtonElement>('[data-show]')];
    let glide: ReturnType<typeof animate> | null = null;
    // Divider position in percent from the left; past halfway the plan is the main view.
    const setSplit = (value: number) => {
      slider.style.setProperty('--split', value + '%');
      range.value = String(Math.round(value));
      const view = value > 50 ? 'plan' : 'built';
      if (stage.dataset.view === view) return;
      stage.dataset.view = view;
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.show === view)));
      placePill(pill, buttons.find(button => button.dataset.show === view)!, true);
    };
    range.addEventListener('input', () => { glide?.stop(); setSplit(Number(range.value)); });
    range.addEventListener('pointerdown', () => { slider.dataset.dragging = ''; });
    addEventListener('pointerup', () => { delete slider.dataset.dragging; });
    buttons.forEach(button => button.addEventListener('click', () => {
      const target = button.dataset.show === 'plan' ? 100 : 0;
      glide?.stop();
      if (mode() === 'full') glide = animate(Number(range.value), target, { type: 'spring', visualDuration: 0.7, bounce: 0.1, onUpdate: setSplit });
      else setSplit(target);
    }));
    placePill(pill, buttons.find(button => button.getAttribute('aria-pressed') === 'true')!, false);
    addEventListener('resize', () => placePill(pill, buttons.find(button => button.getAttribute('aria-pressed') === 'true')!, false));
  }

  let current = 0, timer: ReturnType<typeof setTimeout> | undefined, auto = true;
  const bars = tabs.map(tab => tab.querySelector<HTMLElement>('.approach-compare-tab-bar span')!);
  const select = (index: number) => {
    if (index === current) return;
    const previous = stages[current]; current = index;
    tabs.forEach((tab, i) => tab.setAttribute('aria-pressed', String(i === index)));
    previous.hidden = true; previous.dataset.active = 'false';
    const stage = stages[index]; stage.hidden = false; stage.dataset.active = 'true';
    stage.querySelectorAll<HTMLElement>('.approach-toggle-pill').forEach(pill => placePill(pill, stage.querySelector<HTMLButtonElement>('[data-show][aria-pressed="true"]')!, false));
    spring(stage.querySelector('.approach-slider')!, { opacity: [0, 1], scale: [0.985, 1] }, { type: 'spring', visualDuration: 0.5, bounce: 0 });
    spring([...stage.querySelectorAll('.approach-compare-copy > *')], { opacity: [0, 1], y: [10, 0] }, { ...structure, delay: (i: number) => 0.08 + i * 0.04 });
  };
  // Until a visitor takes over, the tabs advance on their own, each bar filling as it plays.
  const play = () => {
    if (!auto || mode() !== 'full') { bars.forEach((bar, i) => { bar.style.transform = `scaleX(${i === current ? 1 : 0})`; }); return; }
    bars.forEach((bar, i) => { if (i !== current) bar.style.transform = 'scaleX(0)'; });
    animate(bars[current], { scaleX: [0, 1] }, { duration: 7, ease: 'linear' });
    timer = setTimeout(() => { select((current + 1) % stages.length); play(); }, 7000);
  };
  const stop = () => { auto = false; clearTimeout(timer); bars.forEach((bar, i) => { animate(bar, { scaleX: i === current ? 1 : 0 }, { duration: 0.3 }); }); };
  tabs.forEach((tab, index) => tab.addEventListener('click', () => { stop(); select(index); bars.forEach((bar, i) => { bar.style.transform = `scaleX(${i === index ? 1 : 0})`; }); }));
  compare.addEventListener('pointerdown', event => { if ((event.target as Element).closest('[data-slider], [data-show]')) stop(); });
  compare.addEventListener('focusin', () => { if (auto) stop(); });
  let started = false;
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !started) { started = true; play(); }
    else if (!entry.isIntersecting && auto && started) { clearTimeout(timer); started = false; }
  }, { threshold: 0.4 }).observe(compare);
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
