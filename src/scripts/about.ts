import {animate,mode,setupReveals,setupImageErrors} from './motion';
document.documentElement.dataset.enhanced = 'true';
setupImageErrors();setupReveals();
const running=new Set<Animation>();
const track=(animation:Animation|null)=>{if(!animation)return;running.add(animation);void animation.finished.finally(()=>running.delete(animation)).catch(()=>{});};
document.querySelectorAll<HTMLElement>('[data-about-arrival]').forEach((element,index)=>{
  const arrival=animate(element,[{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],700);
  if(arrival&&mode()==='full')arrival.effect?.updateTiming({delay:index*80,fill:'backwards'});
  track(arrival);
});
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
// Keep native details semantics and no-script operation, while allowing interrupted height changes.
const disclosures=new Map<HTMLDetailsElement,Animation>();
document.querySelectorAll<HTMLDetailsElement>('.practice-disclosure').forEach(details=>{
  const summary=details.querySelector('summary')!;
  let desired=details.open;
  summary.addEventListener('click',event=>{
    if(mode()!=='full')return;
    event.preventDefault();desired=!desired;
    const start=details.getBoundingClientRect().height;
    disclosures.get(details)?.cancel();
    details.open=true;details.style.overflow='hidden';
    const end=desired?details.getBoundingClientRect().height:summary.getBoundingClientRect().height+1;
    const animation=animate(details,[{height:`${start}px`},{height:`${end}px`}],360);
    if(!animation){details.open=desired;details.style.removeProperty('overflow');return;}
    disclosures.set(details,animation);
    void animation.finished.then(()=>{if(disclosures.get(details)===animation){details.open=desired;details.style.removeProperty('overflow');disclosures.delete(details);}}).catch(()=>{});
  });
  details.addEventListener('toggle',()=>{if(!disclosures.has(details))desired=details.open;});
});
document.addEventListener('pi:motion',()=>{running.forEach(a=>a.cancel());filterAnimations.forEach(a=>a.cancel());for(const [details,animation] of disclosures){animation.finish();details.style.removeProperty('overflow');}});

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
document.querySelectorAll<HTMLElement>('[data-scope-index]').forEach(item=>{
 item.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')void showScope(item);});
 item.addEventListener('focusin',()=>void showScope(item));
 item.querySelector('summary')!.addEventListener('click',()=>void showScope(item));
});
