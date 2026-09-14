import { animate, mode } from './motion';
type View={id:string;label:string;image:string;alt:string;detail:string;detailAlt:string;caption:string;title:string;copy:string};
const section=document.querySelector<HTMLElement>('#featured');
if(section){
  const views=JSON.parse(section.querySelector('#featured-view-data')!.textContent!) as View[];
  const tabs=[...section.querySelectorAll<HTMLButtonElement>('[data-featured-view]')];
  const panel=section.querySelector<HTMLElement>('#featured-perspective')!;
  const main=section.querySelector<HTMLImageElement>('[data-featured-image]')!;
  const detail=section.querySelector<HTMLImageElement>('[data-featured-detail]')!;
  const title=section.querySelector<HTMLElement>('[data-featured-title]')!;
  const copy=section.querySelector<HTMLElement>('[data-featured-copy]')!;
  const caption=section.querySelector<HTMLElement>('[data-featured-caption]')!;
  const status=section.querySelector<HTMLElement>('.featured-status')!;
  const cache=new Map<string,Promise<void>>(),animations=new Set<Animation>();
  let request=0,selected=0;
  const load=(src:string)=>{
    if(!cache.has(src)){const image=new Image();image.src=src;cache.set(src,image.decode().catch(error=>{cache.delete(src);throw error;}));}
    return cache.get(src)!;
  };
  const settle=()=>{animations.forEach(animation=>animation.cancel());animations.clear();section.querySelectorAll('.featured-outgoing').forEach(image=>image.remove());};
  const track=(animation:Animation|null)=>{if(animation){animations.add(animation);void animation.finished.finally(()=>animations.delete(animation)).catch(()=>{});}};
  const swap=(image:HTMLImageElement,src:string,alt:string)=>{
    const previous=mode()==='off'?null:image.cloneNode() as HTMLImageElement;
    if(previous){previous.removeAttribute('data-featured-image');previous.removeAttribute('data-featured-detail');previous.alt='';previous.className='featured-outgoing';previous.setAttribute('aria-hidden','true');previous.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1';image.parentElement!.append(previous);}
    image.src=src;image.alt=alt;image.style.removeProperty('opacity');image.parentElement?.classList.remove('media-unavailable');
    track(animate(image,[{opacity:0},{opacity:1}],320));
    if(previous){const fading=animate(previous,[{opacity:1},{opacity:0}],320);track(fading);if(fading)void fading.finished.finally(()=>previous.remove()).catch(()=>{});else previous.remove();}
  };
  const select=async(index:number)=>{
    const ticket=++request,view=views[index];status.textContent='';
    if(index===selected)return;
    const pending=window.setTimeout(()=>{if(ticket===request)status.textContent='Loading project photographs…';},300);
    try{
      await Promise.all([load(view.image),load(view.detail)]);if(ticket!==request)return;
      settle();selected=index;
      tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
      panel.setAttribute('aria-labelledby',tabs[index].id);
      swap(main,view.image,view.alt);swap(detail,view.detail,view.detailAlt);
      title.textContent=view.title;copy.textContent=view.copy;caption.textContent=view.caption;
      [title,copy,caption].forEach(element=>track(animate(element,[{opacity:.3},{opacity:1}],240)));
      status.textContent='';
    }catch{if(ticket===request)status.textContent='These photographs could not be loaded. Choose another view or open the project.';}
    finally{clearTimeout(pending);}
  };
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>void select(index));
    tab.addEventListener('keydown',event=>{
      let next:number|undefined;
      if(event.key==='ArrowRight')next=(index+1)%tabs.length;
      if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
      if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;
      if(next!==undefined){event.preventDefault();tabs[next].focus();void select(next);}
    });
  });
  document.addEventListener('pi:motion',settle);
  window.addEventListener('pagehide',()=>{++request;settle();});
}
