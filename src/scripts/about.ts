import {animate,mode,setupReveals,setupImageErrors} from './motion';
document.documentElement.dataset.enhanced = 'true';
setupImageErrors();setupReveals();
const running=new Set<Animation>();
const track=(animation:Animation|null)=>{if(!animation)return;running.add(animation);void animation.finished.finally(()=>running.delete(animation)).catch(()=>{});};
// Opening motion is CSS-driven before first paint; never restart it after module loading.
const entries=[...document.querySelectorAll<HTMLElement>('.experience-entry')];
const filters=[...document.querySelectorAll<HTMLButtonElement>('[data-experience-filter]')];
const filterAnimations=new Set<Animation>();
filters.forEach(button=>button.addEventListener('click',()=>{
  const selected=button.dataset.experienceFilter!;
  const before=new Map(entries.filter(e=>!e.hidden).map(e=>[e,e.getBoundingClientRect()]));
  filterAnimations.forEach(a=>a.cancel());filterAnimations.clear();
  filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  entries.forEach(e=>{e.hidden=selected!=='All'&&!e.dataset.experienceCategory!.split('|').includes(selected);});
  const visible=entries.filter(e=>!e.hidden);
  const after=new Map(visible.map(e=>[e,e.getBoundingClientRect()]));
  visible.forEach((element,index)=>{const previous=before.get(element),next=after.get(element)!;
    const x=previous?Math.max(-180,Math.min(180,previous.left-next.left)):0;
    const y=previous?Math.max(-100,Math.min(100,previous.top-next.top)):20;
    const animation=animate(element,[{opacity:previous ? .9 : 0,transform:`translate(${x}px,${y}px)`},{opacity:1,transform:'translate(0,0)'}],500+Math.min(index*25,150));
    if(animation){filterAnimations.add(animation);void animation.finished.finally(()=>filterAnimations.delete(animation)).catch(()=>{});}
  });
  document.querySelector('[data-experience-status]')!.textContent=`${visible.length} projects shown${selected==='All'?'':': '+selected}.`;
}));
document.addEventListener('pi:motion',()=>{running.forEach(a=>a.cancel());filterAnimations.forEach(a=>a.cancel());});

const scopeImage=document.querySelector<HTMLImageElement>('#scope-image')!;
const scopeCaption=document.querySelector<HTMLElement>('#scope-caption')!;
let scopeRequest=0;
const scopeCache=new Map<string,Promise<void>>();
const showScope=async(item:HTMLElement)=>{
 const ticket=++scopeRequest;
 const src=item.dataset.scopeSrc!;if(scopeImage.getAttribute('src')===src){scopeCaption.textContent=item.dataset.scopeCaption!;return;}
 if(!scopeCache.has(src)){const image=new Image();image.src=src;scopeCache.set(src,image.decode().catch(error=>{scopeCache.delete(src);throw error;}));}
 try{await scopeCache.get(src);if(ticket!==scopeRequest)return;
 const old=scopeImage.cloneNode() as HTMLImageElement;old.removeAttribute('id');old.alt='';old.setAttribute('aria-hidden','true');old.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
 scopeImage.parentElement!.querySelectorAll('[aria-hidden]').forEach(e=>e.remove());scopeImage.parentElement!.append(old);
 scopeImage.src=src;scopeImage.alt=item.dataset.scopeAlt!;scopeCaption.textContent=item.dataset.scopeCaption!;
 track(animate(scopeImage,[{transform:'scale(1.035)'},{transform:'scale(1)'}],650));const fade=animate(old,[{opacity:1},{opacity:0}],450);track(fade);if(fade)void fade.finished.finally(()=>old.remove()).catch(()=>{});else old.remove();
 }catch{/* Preserve the current photograph when an image is unavailable. */}
};

const stageButtons=[...document.querySelectorAll<HTMLButtonElement>('[data-scope-index]')];
const stagePanels=[...document.querySelectorAll<HTMLElement>('.scope-panel')];
const chooseStage=(index:number)=>{
 stageButtons.forEach((button,i)=>{button.setAttribute('aria-selected',String(i===index));button.tabIndex=i===index?0:-1;});
 stagePanels.forEach((panel,i)=>{panel.dataset.active=String(i===index);});
 track(animate(stagePanels[index],[{opacity:.2,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],420));
 void showScope(stageButtons[index]);
};
stageButtons.forEach((button,index)=>{
 button.addEventListener('click',()=>chooseStage(index));
 button.addEventListener('keydown',event=>{let next:number|undefined;if(event.key==='ArrowRight')next=(index+1)%3;if(event.key==='ArrowLeft')next=(index+2)%3;if(event.key==='Home')next=0;if(event.key==='End')next=2;if(next!==undefined){event.preventDefault();chooseStage(next);stageButtons[next].focus({preventScroll:true});}});
});
const atmosphere=document.querySelector<HTMLImageElement>('.practice-atmosphere img')!;
let ambient:Animation|undefined,visible=false;
const syncAtmosphere=()=>{
 if(mode()!=='full'){ambient?.cancel();ambient=undefined;return;}
 if(!ambient){ambient=atmosphere.animate([{transform:'translateX(-1%) scale(1.08)'},{transform:'translateX(1%) scale(1.08)'}],{duration:16000,iterations:Infinity,direction:'alternate',easing:'ease-in-out'});}
 if(visible&&!document.hidden)ambient.play();else ambient.pause();
};
new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;syncAtmosphere();}).observe(atmosphere.closest('.about-practice')!);
document.addEventListener('visibilitychange',syncAtmosphere);document.addEventListener('pi:motion',syncAtmosphere);

