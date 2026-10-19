import { root, setupImageErrors } from './motion';
import { arrive, revealOnView, spring, structure } from './spring';

root.dataset.enhanced = 'true';
setupImageErrors();
arrive([...document.querySelectorAll('[data-service-arrive]')], 10);
revealOnView();

// Plan / Built switch: the pill slides behind the chosen button and the two
// images cross-fade with a slight settle.
for (const pair of document.querySelectorAll<HTMLElement>('[data-pair]')) {
  const pill = pair.querySelector<HTMLElement>('.approach-toggle-pill')!;
  const buttons = [...pair.querySelectorAll<HTMLButtonElement>('[data-show]')];
  const place = (button: HTMLButtonElement, animate: boolean) => {
    const keyframes = { x: button.offsetLeft - 3, width: button.offsetWidth };
    if (!animate || !spring(pill, keyframes, { type: 'spring', visualDuration: 0.3, bounce: 0.15 })) {
      pill.style.transform = `translateX(${keyframes.x}px)`; pill.style.width = keyframes.width + 'px';
    }
  };
  const show = (view: string) => {
    if (pair.dataset.view === view) return;
    pair.dataset.view = view;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.show === view)));
    place(buttons.find(button => button.dataset.show === view)!, true);
    const layer = pair.querySelector(`[data-layer="${view}"]`)!;
    spring(layer, { opacity: [0, 1], scale: [1.03, 1], filter: ['blur(4px)', 'blur(0px)'] }, structure);
  };
  buttons.forEach(button => button.addEventListener('click', () => show(button.dataset.show!)));
  place(buttons.find(button => button.getAttribute('aria-pressed') === 'true')!, false);
  addEventListener('resize', () => place(buttons.find(button => button.getAttribute('aria-pressed') === 'true')!, false));
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
