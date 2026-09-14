import { animate, mode } from './motion';

type View = { id: string; label: string; image: string; alt: string; detail: string; detailAlt: string; copy: string };
const section = document.querySelector<HTMLElement>('#featured');
if (section) {
  const views = JSON.parse(section.querySelector('#featured-view-data')!.textContent!) as View[];
  const tabs = [...section.querySelectorAll<HTMLButtonElement>('[data-featured-view]')];
  const panel = section.querySelector<HTMLElement>('#featured-perspective')!;
  const main = section.querySelector<HTMLImageElement>('[data-featured-image]')!;
  const secondary = section.querySelector<HTMLImageElement>('[data-featured-detail]')!;
  const copy = section.querySelector<HTMLElement>('[data-featured-copy]')!;
  const status = section.querySelector<HTMLElement>('.featured-status')!;
  const toggle = section.querySelector<HTMLButtonElement>('[data-featured-autoplay-toggle]')!;
  const cache = new Map<string, Promise<void>>(), animations = new Set<Animation>();
  const dwell = 7000;
  let request = 0, selected = 0, intended = 0;
  let hoverTimer: number | undefined, autoplayTimer: number | undefined, loadingTimer: number | undefined;
  let visible = false, hovered = false, focused = section.contains(document.activeElement), paused = false, away = false;
  let pending: 'automatic' | 'manual' | null = null;

  const load = (src: string) => {
    if (!cache.has(src)) {
      const image = new Image(); image.src = src;
      cache.set(src, image.decode().catch(error => { cache.delete(src); throw error; }));
    }
    return cache.get(src)!;
  };
  const clearAutoplay = () => { clearTimeout(autoplayTimer); autoplayTimer = undefined; };
  const canRotate = () => mode() === 'full' && visible && !document.hidden && !hovered && !focused && !paused && !away;
  const settle = () => {
    animations.forEach(animation => animation.cancel()); animations.clear();
    section.querySelectorAll('.featured-outgoing').forEach(image => image.remove());
  };
  const sync = () => {
    const enabled = mode() === 'full';
    toggle.disabled = !enabled;
    toggle.toggleAttribute('data-autoplay-paused', paused || !enabled);
    toggle.setAttribute('aria-label', !enabled ? 'Automatic featured views are off with this motion setting' : paused ? 'Resume automatic featured views' : 'Pause automatic featured views');
    if (!canRotate()) {
      clearAutoplay();
      // An image still being decoded must not arrive after someone has paused,
      // focused the section, changed motion settings, or left the page.
      if (pending === 'automatic') {
        ++request; pending = null; intended = selected; clearTimeout(loadingTimer);
        panel.removeAttribute('aria-busy'); status.textContent = '';
      }
      section.dataset.featuredAutoplay = enabled ? 'paused' : 'off';
      return;
    }
    if (pending || animations.size) { section.dataset.featuredAutoplay = 'changing'; return; }
    section.dataset.featuredAutoplay = 'running';
    if (autoplayTimer === undefined) autoplayTimer = window.setTimeout(() => {
      autoplayTimer = undefined;
      if (canRotate()) void select((selected + 1) % views.length, true, 1);
    }, dwell);
  };
  const track = (animation: Animation | null) => {
    if (!animation) return;
    animations.add(animation);
    void animation.finished.finally(() => { animations.delete(animation); sync(); }).catch(() => {});
  };
  const swap = (image: HTMLImageElement, src: string, alt: string, direction: number) => {
    const previous = mode() === 'off' || !image.complete || !image.naturalWidth ? null : image.cloneNode() as HTMLImageElement;
    if (previous) {
      previous.removeAttribute('data-featured-image'); previous.removeAttribute('data-featured-detail');
      previous.alt = ''; previous.className = 'featured-outgoing'; previous.setAttribute('aria-hidden', 'true');
      previous.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1';
      image.parentElement!.append(previous);
    }
    image.src = src; image.alt = alt; image.style.removeProperty('opacity');
    image.parentElement?.classList.remove('media-unavailable');
    // The decoded photograph stays opaque below the outgoing view: no dark
    // midpoint, blank frame, or moving layout. Only a restrained camera settle.
    if (mode() === 'full') track(animate(image, [
      { transform: `translateX(${direction * 6}px) scale(1.025)` },
      { transform: 'translateX(0px) scale(1)' },
    ], 650));
    if (previous) {
      const fading = animate(previous, [{ opacity: 1 }, { opacity: 0 }], 620); track(fading);
      if (fading) void fading.finished.finally(() => previous.remove()).catch(() => {});
      else previous.remove();
    }
  };
  const select = async (index: number, automatic = false, direction = index >= selected ? 1 : -1) => {
    clearTimeout(hoverTimer); clearTimeout(loadingTimer); clearAutoplay();
    const ticket = ++request, view = views[index]; intended = index; status.textContent = '';
    pending = automatic ? 'automatic' : 'manual';
    if (index === selected) { pending = null; panel.removeAttribute('aria-busy'); sync(); return; }
    panel.setAttribute('aria-busy', 'true');
    if (!automatic) loadingTimer = window.setTimeout(() => { if (ticket === request) status.textContent = 'Loading project photographs…'; }, 300);
    try {
      await Promise.all([load(view.image), load(view.detail)]);
      if (ticket !== request || (automatic && !canRotate())) return;
      settle(); selected = index;
      tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
      panel.setAttribute('aria-labelledby', tabs[index].id);
      swap(main, view.image, view.alt, direction);
      swap(secondary, view.detail, view.detailAlt, -direction);
      copy.textContent = view.copy;
      track(animate(copy, [{ opacity: .3 }, { opacity: 1 }], 520));
      status.textContent = '';
    } catch {
      if (ticket === request) {
        intended = selected;
        if (automatic) paused = true;
        status.textContent = automatic ? 'Automatic views paused. These photographs could not be loaded.' : 'These photographs could not be loaded. Choose another view or open the project.';
      }
    } finally {
      if (ticket === request) {
        clearTimeout(loadingTimer); pending = null; panel.removeAttribute('aria-busy'); sync();
      }
    }
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse' || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;
      clearTimeout(hoverTimer); hoverTimer = window.setTimeout(() => void select(index), 120);
    });
    tab.addEventListener('pointerleave', () => clearTimeout(hoverTimer));
    tab.addEventListener('focus', () => void select(index));
    tab.addEventListener('click', () => void select(index));
    tab.addEventListener('keydown', event => {
      let next: number | undefined;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0; if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); tabs[next].focus({ preventScroll: true }); }
    });
  });
  section.querySelector('[data-featured-previous]')!.addEventListener('click', () => void select((intended + views.length - 1) % views.length, false, -1));
  section.querySelector('[data-featured-next]')!.addEventListener('click', () => void select((intended + 1) % views.length, false, 1));
  toggle.addEventListener('click', () => { paused = !paused; sync(); });
  section.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovered = true; sync(); } });
  section.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse') { hovered = false; sync(); } });
  section.addEventListener('focusin', () => { focused = true; sync(); });
  section.addEventListener('focusout', () => queueMicrotask(() => { focused = section.contains(document.activeElement); sync(); }));
  const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting && entry.intersectionRatio >= .35; sync(); }, { threshold: [0, .35] });
  visibility.observe(section.querySelector('.featured-media')!);
  document.addEventListener('visibilitychange', () => { if (document.hidden) settle(); sync(); });
  document.addEventListener('pi:motion', () => { settle(); sync(); });
  window.addEventListener('pagehide', () => {
    away = true; ++request; pending = null; intended = selected;
    clearTimeout(hoverTimer); clearTimeout(loadingTimer); clearAutoplay();
    panel.removeAttribute('aria-busy'); status.textContent = ''; settle(); sync();
  });
  window.addEventListener('pageshow', () => {
    away = false; focused = section.contains(document.activeElement);
    hovered = matchMedia('(hover:hover) and (pointer:fine)').matches && section.matches(':hover');
    sync();
  });
  sync();
}
