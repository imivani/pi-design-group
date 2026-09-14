import { root, mode, read, write, animate, setupReveals, setupImageErrors } from './motion';
type ServiceId = 'multifamily' | 'commercial' | 'parks';
const gallery = document.querySelector<HTMLElement>('.service-gallery')!;
const serviceTabs = [...gallery.querySelectorAll<HTMLButtonElement>('[data-service]')];
const servicePanels = [...gallery.querySelectorAll<HTMLElement>('[data-service-panel]')];
const smallScreen = matchMedia('(max-width:767px)');
let activeService: ServiceId | null = 'multifamily';
let hoverTimer: ReturnType<typeof setTimeout> | undefined;
function selectService(id: ServiceId | null) {
  clearTimeout(hoverTimer);
  if (id && !serviceTabs.some(tab => tab.dataset.service === id)) return;
  activeService = id;
  gallery.dataset.active = id || 'none';
  servicePanels.forEach(panel => {
    const active = panel.dataset.servicePanel === id;
    panel.dataset.active = String(active);
    panel.querySelector('button')!.setAttribute('aria-expanded', String(active));
    panel.querySelector('.service-description')!.setAttribute('aria-hidden', String(!active));
  });
}
serviceTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectService(smallScreen.matches && activeService === tab.dataset.service ? null : tab.dataset.service as ServiceId));
  tab.addEventListener('focus', () => { if (tab.matches(':focus-visible')) selectService(tab.dataset.service as ServiceId); });
  tab.addEventListener('keydown', event => {
    let next: number | undefined;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % serviceTabs.length;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + serviceTabs.length - 1) % serviceTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = serviceTabs.length - 1;
    if (next !== undefined) { event.preventDefault(); serviceTabs[next].focus({ preventScroll: true }); selectService(serviceTabs[next].dataset.service as ServiceId); }
  });
  const panel = tab.closest<HTMLElement>('.service-panel')!;
  panel.addEventListener('click', event => {
    if ((event.target as Element).closest('button')) return;
    selectService(smallScreen.matches && activeService === tab.dataset.service ? null : tab.dataset.service as ServiceId);
  });
  panel.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse' || smallScreen.matches || !matchMedia('(hover:hover)').matches) return;
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => selectService(tab.dataset.service as ServiceId), 120);
  });
  panel.addEventListener('pointerleave', () => clearTimeout(hoverTimer));
});
new ResizeObserver(() => {
  const padding = innerWidth <= 1199 ? 40 : 56;
  gallery.style.setProperty('--service-copy-width', Math.max(200, (gallery.clientWidth - 28) * 2.2 / 4.2 - padding) + 'px');
}).observe(gallery);
smallScreen.addEventListener('change', () => { clearTimeout(hoverTimer); if (!smallScreen.matches && !activeService) selectService('multifamily'); });
document.addEventListener('pi:service', ((event: CustomEvent<{ id: ServiceId }>) => selectService(event.detail.id)) as EventListener);
const requestedService = new URL(location.href).searchParams.get('service');
selectService(serviceTabs.some(tab=>tab.dataset.service===requestedService) ? requestedService as ServiceId : 'multifamily');
let reveals: ReturnType<typeof setupReveals> | undefined;
// P040 / P041 / P079: complete catalogue, direct results, stable focus and history.
const collection = document.querySelector<HTMLElement>('#project-collection')!;
const entries = [...collection.querySelectorAll<HTMLElement>('[data-project]')];
const filters = [...document.querySelectorAll<HTMLButtonElement>('[data-filter]')];
const views = [...document.querySelectorAll<HTMLButtonElement>('[data-view]')].filter(el => el.tagName === 'BUTTON');
const search = document.querySelector<HTMLInputElement>('#project-search')!;
const count = document.querySelector<HTMLElement>('#project-count')!;
const empty = document.querySelector<HTMLElement>('#project-empty')!;
const indexHead = document.querySelector<HTMLElement>('.index-head')!;
const filterIndicator = document.querySelector<HTMLElement>('.filter-indicator')!;
let category = 'all';
let view = 'grid';
const normalize = (value: string) => value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, '').trim();
function positionFilterIndicator() {
  const button = filters.find(item => item.dataset.filter === category)!;
  filterIndicator.style.width = button.offsetWidth + 'px';
  filterIndicator.style.transform = 'translateX(' + button.offsetLeft + 'px)';
  filterIndicator.style.opacity = '1';
}
function updateProjects(save = true) {
  const terms = normalize(search.value).split(/\s+/).filter(Boolean);
  let matches = 0;
  entries.forEach(entry => {
    const searchable = normalize(entry.dataset.search || '');
    const visible = (category === 'all' || entry.dataset.category === category) && terms.every(term => searchable.includes(term));
    entry.hidden = !visible;
    if (visible) matches++;
  });
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  views.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view)));
  collection.dataset.view = view;
  indexHead.hidden = view !== 'index' || matches === 0;
  empty.hidden = matches !== 0;
  count.textContent = matches === entries.length ? entries.length + ' entries' : matches + ' of ' + entries.length + ' entries';
  positionFilterIndicator();
  reveals?.refreshRows(collection, entries);
  if (save) {
    const url = new URL(location.href);
    if (category === 'all') url.searchParams.delete('category'); else url.searchParams.set('category', category);
    if (view === 'grid') url.searchParams.delete('view'); else url.searchParams.set('view', view);
    if (!search.value.trim()) url.searchParams.delete('q'); else url.searchParams.set('q', search.value.trim());
    history.replaceState(history.state, '', url);
  }
}
function restoreProjectState() {
  const params = new URL(location.href).searchParams;
  const wanted = params.get('category') || 'all';
  category = filters.some(button => button.dataset.filter === wanted) ? wanted : 'all';
  view = params.get('view') === 'index' ? 'index' : 'grid';
  search.value = params.get('q') || '';
  updateProjects(false);
}
filters.forEach(button => button.addEventListener('click', () => { category = button.dataset.filter!; updateProjects(); }));
views.forEach(button => button.addEventListener('click', () => {
  const next = button.dataset.view!;
  if (next === view) return;
  view = next;
  const opacity = collection.getAnimations().length ? getComputedStyle(collection).opacity : '.72';
  collection.getAnimations().forEach(animation => animation.cancel());
  updateProjects();
  animate(collection, [{ opacity }, { opacity: 1 }], 180);
}));
search.addEventListener('input', () => updateProjects());
document.querySelector('#reset-projects')!.addEventListener('click', () => { category = 'all'; search.value = ''; updateProjects(); search.focus({ preventScroll: true }); });
document.addEventListener('pi:filter', ((event: CustomEvent<{ category: string }>) => {
  if (!filters.some(button => button.dataset.filter === event.detail.category)) return;
  category = event.detail.category;
  search.value = '';
  updateProjects();
}) as EventListener);
window.addEventListener('popstate', restoreProjectState);
new ResizeObserver(positionFilterIndicator).observe(document.querySelector('.project-filters')!);
restoreProjectState();

// P065 / P066 / P109 / P113: actual media state, manual pause and visibility.
const video = document.querySelector<HTMLVideoElement>('#hero-video')!;
const videoButton = document.querySelector<HTMLButtonElement>('#video-toggle')!;
const hero = document.querySelector<HTMLElement>('#hero')!;
const videoStatus = document.querySelector<HTMLElement>('#video-status')!;
let heroVisible = true;
let manualPause = read('pi-video-paused', 'session') === 'true';
let explicitPlayback = false;
let playRequest = 0;
const wantsVideo = () => !document.hidden && heroVisible && !manualPause && (mode() === 'full' || explicitPlayback);
function syncVideoButton() {
  const playing = !video.paused && !video.ended;
  videoButton.toggleAttribute('data-playing', playing);
  videoButton.setAttribute('aria-label', playing ? 'Pause background video' : 'Play background video');
}
function loadVideo() { if (!video.getAttribute('src')) { video.src = video.dataset.src!; video.load(); } }
async function playVideo(explicit = false) {
  const request = ++playRequest;
  if (explicit) { explicitPlayback = true; manualPause = false; write('pi-video-paused', 'false', 'session'); }
  if (!wantsVideo()) return;
  loadVideo();
  if (video.error) video.load();
  video.loop = mode() === 'full';
  try {
    await video.play();
    if (!wantsVideo()) video.pause();
  } catch {
    if (request !== playRequest) return;
    videoStatus.textContent = video.error ? 'The video is unavailable. The project photograph is displayed.' : 'Video is paused. Use the play control to start it.';
    syncVideoButton();
  }
}
function suspendVideo() { ++playRequest; video.pause(); }
videoButton.addEventListener('click', () => {
  if (!video.paused) {
    manualPause = true; explicitPlayback = false;
    write('pi-video-paused', 'true', 'session');
    suspendVideo();
  } else void playVideo(true);
});
video.addEventListener('play', syncVideoButton);
video.addEventListener('pause', syncVideoButton);
video.addEventListener('ended', syncVideoButton);
video.addEventListener('playing', () => {
  hero.setAttribute('data-video-ready', '');
  document.querySelector<HTMLElement>('[data-poster-caption]')!.hidden = true;
  document.querySelector<HTMLElement>('[data-video-caption]')!.hidden = false;
  videoStatus.textContent = '';
  syncVideoButton();
});
video.addEventListener('error', () => {
  hero.removeAttribute('data-video-ready');
  document.querySelector<HTMLElement>('[data-poster-caption]')!.hidden = false;
  document.querySelector<HTMLElement>('[data-video-caption]')!.hidden = true;
  videoStatus.textContent = 'The video is unavailable. The project photograph is displayed.';
  syncVideoButton();
});
const heroObserver = new IntersectionObserver(([entry]) => {
  heroVisible = entry.isIntersecting;
  if (!heroVisible) suspendVideo(); else void playVideo();
}, { threshold: .04 });
heroObserver.observe(hero);
document.addEventListener('visibilitychange', () => { if (document.hidden) suspendVideo(); else void playVideo(); });
document.addEventListener('pi:motion', () => {
  if (mode() !== 'full') { explicitPlayback = false; suspendVideo(); }
  else void playVideo();
});
window.addEventListener('pagehide', suspendVideo);
window.addEventListener('pageshow', () => { syncVideoButton(); if (!manualPause) void playVideo(); });
syncVideoButton();

root.dataset.enhanced = 'true';
setupImageErrors();
reveals = setupReveals();
reveals.refreshRows(collection, entries);
new ResizeObserver(() => reveals?.refreshRows(collection, entries)).observe(collection);
positionFilterIndicator();
if (read('pi-focus-project-search','session') === 'true') {
  try { sessionStorage.removeItem('pi-focus-project-search'); } catch {}
  const focusSearch = () => requestAnimationFrame(()=>search.focus({preventScroll:true}));
  if(document.readyState==='complete') focusSearch();
  else window.addEventListener('pageshow',focusSearch,{once:true});
}
if (read('pi-project-resume','session') === 'true') {
  try {
    sessionStorage.removeItem('pi-project-resume');
    const saved = JSON.parse(read('pi-project-return','session') || 'null');
    if (saved && new URL(saved.url,location.origin).search === location.search) {
      reveals.settle();
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        window.scrollTo({top:saved.scroll,behavior:'instant'});
        entries.find(entry=>entry.dataset.project===saved.id)?.querySelector('a')?.focus({preventScroll:true});
      }));
    }
  } catch {}
}
document.querySelectorAll<HTMLAnchorElement>('[data-project-card]').forEach(anchor => anchor.addEventListener('click', event => {
  if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  write('pi-project-return', JSON.stringify({ url: location.pathname + location.search + '#projects', scroll: scrollY, id: anchor.dataset.projectCard }), 'session');
  const img = anchor.querySelector<HTMLImageElement>('img');
  if (img && mode() === 'full') img.style.viewTransitionName = 'project-photo';
}));
