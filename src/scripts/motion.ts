export type MotionMode = 'full' | 'reduced' | 'off';
export const root = document.documentElement;
export const mode = () => root.dataset.motion as MotionMode;
export const read = (key: string, kind: 'local' | 'session' = 'local') => { try { return (kind === 'session' ? window.sessionStorage : window.localStorage).getItem(key); } catch { return null; } };
export const write = (key: string, value: string, kind: 'local' | 'session' = 'local') => { try { (kind === 'session' ? window.sessionStorage : window.localStorage).setItem(key, value); } catch {} };
const activeAnimations = new Set<Animation>();
const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');

export function animate(element: Element, keyframes: Keyframe[], duration = 320) {
  if (mode() === 'off') return null;
  const frames = mode() === 'reduced' ? keyframes.map(({ opacity }) => ({ opacity })) : keyframes;
  const animation = element.animate(frames, { duration: mode() === 'reduced' ? 100 : duration, easing: 'cubic-bezier(.22,1,.36,1)' });
  activeAnimations.add(animation);
  animation.finished.catch(() => {}).finally(() => activeAnimations.delete(animation));
  return animation;
}

const motionSelect = document.querySelector<HTMLSelectElement>('#motion-choice');
if (motionSelect) {
  motionSelect.value = read('pi-motion') || 'system';
  const applyMotion = () => {
    const choice = motionSelect.value;
    root.dataset.motion = choice === 'off' ? 'off' : choice === 'reduced' || reducedQuery.matches ? 'reduced' : 'full';
    for (const animation of activeAnimations) { try { animation.finish(); } catch { animation.cancel(); } }
    document.dispatchEvent(new CustomEvent('pi:motion', { detail: { mode: mode() } }));
  };
  motionSelect.addEventListener('change', () => { write('pi-motion', motionSelect.value); applyMotion(); });
  reducedQuery.addEventListener('change', applyMotion);
}

// P086: the document is visible first. Only offscreen groups are enhanced.
export function setupReveals() {
  const seen = new WeakSet<HTMLElement>();
  const groups = new Map<HTMLElement, { elements: HTMLElement[]; duration: number }>();
  const running = new Map<HTMLElement, Animation>();
  const returning = (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming)?.type === 'back_forward';
  const finish = (element: HTMLElement) => {
    running.get(element)?.cancel(); running.delete(element);
    element.dataset.revealState = 'done'; seen.add(element);
  };
  const reveal = (target: HTMLElement, immediate = false) => {
    const group = groups.get(target);
    if (!group) return;
    observer.unobserve(target); groups.delete(target);
    for (const element of group.elements) {
      if (seen.has(element)) continue;
      seen.add(element);
      if (immediate || mode() !== 'full' || document.hidden) { finish(element); continue; }
      element.dataset.revealState = 'running';
      const animation = animate(element, [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }], group.duration);
      if (!animation) { finish(element); continue; }
      running.set(element, animation);
      void animation.finished.then(() => { if (running.get(element) === animation) { running.delete(element); element.dataset.revealState = 'done'; } }).catch(() => {});
    }
  };
  const observer = new IntersectionObserver(items => {
    for (const item of items) if (item.isIntersecting) reveal(item.target as HTMLElement);
  }, { threshold: 0, rootMargin: '0px 0px -5% 0px' });
  const prepare = (elements: HTMLElement[], duration: number) => {
    const unseen = elements.filter(element => !seen.has(element));
    if (!unseen.length) return;
    if (mode() !== 'full' || returning || unseen[0].getBoundingClientRect().top < innerHeight) { unseen.forEach(finish); return; }
    const target = unseen[0];
    groups.set(target, { elements: unseen, duration });
    observer.observe(target);
    unseen.forEach(element => { element.dataset.revealState = 'pending'; });
  };
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(element => prepare([element], 520));
  const refreshRows = (collection: HTMLElement, entries: HTMLElement[]) => {
    for (const [target, group] of groups) {
      if (!collection.contains(target)) continue;
      observer.unobserve(target); groups.delete(target);
      group.elements.forEach(element => { delete element.dataset.revealState; });
    }
    entries.forEach(element => { if (running.has(element)) finish(element); });
    if (collection.dataset.view === 'index') { entries.forEach(finish); return; }
    const rows = new Map<number, HTMLElement[]>();
    for (const element of entries.filter(item => !item.hidden)) {
      const top = element.offsetTop;
      rows.set(top, [...(rows.get(top) || []), element]);
    }
    rows.forEach(elements => prepare(elements, 480));
  };
  const settle = () => {
    for (const target of [...groups.keys()]) reveal(target, true);
    for (const element of [...running.keys()]) finish(element);
  };
  document.addEventListener('focusin', event => {
    for (const [target, group] of groups) if (group.elements.some(element => element.contains(event.target as Node))) reveal(target, true);
    for (const element of [...running.keys()]) if (element.contains(event.target as Node)) finish(element);
  });
  document.addEventListener('pi:motion', () => { if (mode() !== 'full') settle(); });
  window.addEventListener('pagehide', settle);
  window.addEventListener('beforeprint', settle);
  return { refreshRows, settle };
}

// P093: normal anchor navigation with a stable focus destination.
document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
  if (!anchor) return;
  const href = anchor.getAttribute('href')!;
  const target = href.length > 1 ? document.getElementById(href.slice(1)) : null;
  if (!target) return;
  event.preventDefault();
  if (location.hash !== href) history.pushState(history.state, '', href);
  target.scrollIntoView({ behavior: mode() === 'full' ? 'smooth' : 'instant', block: 'start' });
  if (target.matches('[tabindex], input')) target.focus({ preventScroll: true });
});

export function setupImageErrors() {
  document.querySelectorAll<HTMLImageElement>('img').forEach(img => {
    const handleError = () => {
      const parent = img.parentElement;
      if (parent?.matches('.service-panel')) { parent.setAttribute('data-media-error', ''); parent.querySelector<HTMLElement>('.service-error')!.textContent = 'Photograph unavailable.'; return; }
      if (parent && !parent.matches('.hero-media, .contact')) {
        parent.style.position = 'relative'; parent.classList.add('media-unavailable'); img.style.opacity = '0';
      }
    };
    img.addEventListener('error', handleError);
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) handleError();
  });
}
