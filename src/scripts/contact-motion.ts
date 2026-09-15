import { mode } from './motion';

const panel = document.querySelector<HTMLElement>('.contact-panel');
const photograph = panel?.querySelector<HTMLImageElement>('.contact-panel-image');
if (panel && photograph) {
  let visible = false;
  let movement: Animation | undefined;
  const settle = () => { movement?.cancel(); movement = undefined; panel.dataset.cameraMotion = 'still'; };
  const sync = () => {
    if (mode() !== 'full' || !photograph.complete || !photograph.naturalWidth) { settle(); return; }
    if (!visible || document.hidden) { movement?.pause(); panel.dataset.cameraMotion = 'paused'; return; }
    if (!movement) {
      // A visible, unhurried camera move through one real photograph. Only this image moves;
      // contact text and links remain steady and immediately usable.
      movement = photograph.animate([
        { transform: 'scale(1.18) translate(-2%, -1%)' },
        { transform: 'scale(1.04) translate(1%, .4%)' },
      ], { duration: 12000, iterations: Infinity, direction: 'alternate', easing: 'cubic-bezier(.37,0,.63,1)' });
    }
    movement.play();
    panel.dataset.cameraMotion = 'moving';
  };
  const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: .12 });
  visibility.observe(panel);
  photograph.addEventListener('load', sync);
  photograph.addEventListener('error', settle);
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('pi:motion', sync);
  window.addEventListener('pagehide', settle);
  window.addEventListener('pageshow', sync);
}
