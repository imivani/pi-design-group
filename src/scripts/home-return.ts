import { animate, mode, root } from './motion';

declare global {
  interface Window { __piHomeReturn?: { fresh:boolean; native:ViewTransition | null } }
}

const state=window.__piHomeReturn;
const hero=document.querySelector<HTMLElement>('#hero');
const media=hero?.querySelector<HTMLElement>('.hero-media');
const copy=hero?.querySelector<HTMLElement>('.hero-copy');
const animations=new Set<Animation>();
let started=false;
let finished=false;
const announce=(phase:string)=>document.dispatchEvent(new CustomEvent('pi:home-return',{detail:{phase,path:location.pathname}}));
const settle=(phase='done')=>{
  if(finished)return;
  finished=true;
  animations.forEach(animation=>animation.cancel());
  animations.clear();
  root.dataset.homeReturn=phase;
};
const play=()=>{
  if(finished)return;
  if(!state?.fresh || mode()!=='full' || document.hidden){settle('skipped');return;}
  root.dataset.homeReturn='running';
  const photoMotion=media&&animate(media,[{opacity:0},{opacity:1}],960,'cubic-bezier(.4,0,.2,1)');
  const copyMotion=copy&&animate(copy,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],960,'cubic-bezier(.4,0,.2,1)');
  [photoMotion,copyMotion].forEach(animation=>{if(animation)animations.add(animation);});
  announce('fallback');
  void Promise.all([...animations].map(animation=>animation.finished.catch(()=>{}))).then(()=>settle());
};
const start=()=>{
  if(started || finished)return;
  started=true;
  if(!state?.fresh || mode()!=='full'){settle('skipped');return;}
  const native=state.native;
  if(!native){play();return;}
  const completeNative=async()=>{
    try{await native.ready;announce('native');await native.finished;settle();}
    catch{play();}
  };
  void completeNative();
};
window.addEventListener('pagereveal',start,{once:true});
requestAnimationFrame(()=>requestAnimationFrame(start));
document.addEventListener('pi:motion',()=>{if(mode()!=='full')settle('skipped');});
document.addEventListener('visibilitychange',()=>{if(document.hidden)settle('skipped');});
hero?.addEventListener('pointerdown',()=>settle(),{capture:true});
hero?.addEventListener('focusin',()=>settle());
window.addEventListener('pagehide',()=>{if(state)state.fresh=false;settle('skipped');});
window.addEventListener('pageshow',event=>{if(event.persisted)settle('skipped');});

