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
