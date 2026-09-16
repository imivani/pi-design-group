import { animate, mode, root } from './motion';

declare global {
  interface Window {
    __piProjectArrival?: { fresh:boolean; native:ViewTransition | null };
  }
}

const title = document.querySelector<HTMLElement>('.project-title-row');
const photograph = document.querySelector<HTMLElement>('.project-hero-gallery');
const opening = document.querySelector<HTMLElement>('.project-opening');
const state = window.__piProjectArrival;
const animations = new Set<Animation>();
let started = false;
let finished = false;
const announce = (phase:string) => document.dispatchEvent(new CustomEvent('pi:project-arrival',{detail:{phase,path:location.pathname}}));
const settle = (phase = 'done') => {
  if (finished) return;
  finished = true;
  animations.forEach(animation=>animation.cancel());
  animations.clear();
  root.dataset.projectArrival = phase;
  root.dataset.projectPhotoArrival = 'visible';
};
const play = () => {
  if (finished) return;
  if (!state?.fresh || mode() !== 'full' || document.hidden) { settle('skipped'); return; }
  root.dataset.projectArrival = 'running';
  root.dataset.projectPhotoArrival = 'visible';
  const titleMotion = title && animate(title,[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],560);
  const photoMotion = photograph && animate(photograph,[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],620);
  [titleMotion,photoMotion].forEach(animation=>{if(animation)animations.add(animation);});
  announce('fallback');
  void Promise.all([...animations].map(animation=>animation.finished.catch(()=>{}))).then(()=>settle());
};
const start = () => {
  if (started || finished) return;
  started = true;
  if (!state?.fresh || mode() !== 'full') { settle('skipped'); return; }
  const native = state.native;
  if (!native) { play(); return; }
  const completeNative = async () => {
    try {
      await native.ready;
      announce('native');
      await native.finished;
      settle();
    } catch { play(); }
  };
  void completeNative();
};

window.addEventListener('pagereveal',start,{once:true});
// Browsers without cross-document transitions still receive the same entrance.
// Two frames also cover a module loaded just after the pagereveal notification.
requestAnimationFrame(()=>requestAnimationFrame(start));
document.addEventListener('pi:motion',()=>{if(mode()!=='full')settle('skipped');});
document.addEventListener('visibilitychange',()=>{if(document.hidden)settle('skipped');});
opening?.addEventListener('pointerdown',()=>settle(),{capture:true});
opening?.addEventListener('focusin',()=>settle());
window.addEventListener('pagehide',()=>settle('skipped'));
window.addEventListener('pageshow',event=>{if(event.persisted)settle('skipped');});


