import { animate, mode, root, setupImageErrors, setupReveals } from './motion';

type ContactImage = { id:string; label:string; src:string; alt:string; caption:string; href:string };
const choices = JSON.parse(document.querySelector('#inquiry-media-data')!.textContent!) as ContactImage[];
const form = document.querySelector<HTMLFormElement>('#inquiry-form')!;
const fields = document.querySelector<HTMLElement>('#inquiry-fields')!;
const image = document.querySelector<HTMLImageElement>('#inquiry-photo')!;
const caption = document.querySelector<HTMLElement>('#inquiry-photo-caption')!;
const photoLink = document.querySelector<HTMLAnchorElement>('#inquiry-photo-link')!;
const radios = [...form.querySelectorAll<HTMLInputElement>('[data-inquiry-type]')];
const status = document.querySelector<HTMLElement>('#inquiry-image-status')!;
const prompt = document.querySelector<HTMLElement>('.inquiry-prompt')!;
const prepared = document.querySelector<HTMLElement>('#inquiry-prepared')!;
const feedback = document.querySelector<HTMLElement>('#inquiry-feedback')!;
const emailLink = document.querySelector<HTMLAnchorElement>('#inquiry-email-link')!;
const copyText = document.querySelector<HTMLTextAreaElement>('#inquiry-copy-text')!;
const animations = new Set<Animation>();
const cache = new Map<string,Promise<void>>();
let selected = '', displayed = choices[0].id, request = 0;
let hoverTimer: ReturnType<typeof setTimeout> | undefined;
let draft = '';
const track = (animation:Animation|null) => {
  if (!animation) return;
  animations.add(animation);
  void animation.finished.finally(()=>animations.delete(animation)).catch(()=>{});
};
const settle = () => {
  animations.forEach(animation=>animation.cancel());animations.clear();
  document.querySelectorAll('.inquiry-outgoing').forEach(element=>element.remove());
};
const preview = async (id:string) => {
  const ticket=++request;
  if(id===displayed)return;
  const choice=choices.find(item=>item.id===id);if(!choice)return;
  try {
    if(!cache.has(choice.src)){
      const decoded=new Image();decoded.src=choice.src;
      cache.set(choice.src,decoded.decode().catch(error=>{cache.delete(choice.src);throw error;}));
    }
    await cache.get(choice.src);
    if(ticket!==request)return;
    settle();
    const old=mode()==='off'?null:image.cloneNode() as HTMLImageElement;
    if(old){old.removeAttribute('id');old.alt='';old.className='inquiry-outgoing';old.setAttribute('aria-hidden','true');old.style.zIndex='1';image.parentElement!.append(old);}
    image.src=choice.src;image.alt=choice.alt;displayed=id;
    caption.textContent=choice.caption;photoLink.href=choice.href;status.textContent='';
    if(mode()==='full')track(animate(image,[{transform:'scale(1.055)'},{transform:'scale(1)'}],720));
    track(animate(caption,[{opacity:.3,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],320));
    if(old){const fade=animate(old,[{opacity:1},{opacity:0}],360);track(fade);if(fade)void fade.finished.finally(()=>old.remove()).catch(()=>{});else old.remove();}
  } catch {if(ticket===request)status.textContent='The photo preview is unavailable. You can still send an inquiry.';}
};
const select = (radio:HTMLInputElement) => {
  clearTimeout(hoverTimer);selected=radio.dataset.inquiryType!;
  fields.inert=false;fields.dataset.open='true';prompt.hidden=true;void preview(selected);
};
root.dataset.enhanced='true';
fields.inert=true;prompt.hidden=false;
for(const radio of radios){
  radio.addEventListener('change',()=>select(radio));
  radio.addEventListener('focus',()=>void preview(radio.dataset.inquiryType!));
  radio.closest('label')!.addEventListener('pointerenter',event=>{
    if(event.pointerType!=='mouse')return;
    clearTimeout(hoverTimer);hoverTimer=setTimeout(()=>void preview(radio.dataset.inquiryType!),110);
  });
}
form.querySelector('.inquiry-choices')!.addEventListener('pointerleave',()=>{
  clearTimeout(hoverTimer);void preview(selected||choices[0].id);
});
const initial=radios.find(radio=>radio.checked);if(initial)select(initial);
form.addEventListener('submit',event=>{
  event.preventDefault();if(!form.reportValidity())return;
  const data=new FormData(form);
  const value=(key:string)=>String(data.get(key)||'').trim();
  const subject=`Landscape inquiry: ${value('projectType')} in ${value('location')}`;
  draft=`Hello Peter,\n\n${value('message')}\n\nProject type: ${value('projectType')}\nProject location: ${value('location')}\n\nName: ${value('name')}\nOrganization: ${value('organization')||'Not provided'}\nEmail: ${value('email')}`;
  const href=`mailto:peter@pidesigngroup.ca?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(draft)}`;
  emailLink.href=href;copyText.value=draft;prepared.hidden=false;
  feedback.textContent='Your email draft is ready. If your email app didn’t open, copy the details and email Peter directly.';
  track(animate(prepared,[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],360));
  window.location.href=href;
});
document.querySelector('#inquiry-copy')!.addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(draft);feedback.textContent='Inquiry details copied. Paste them into an email to peter@pidesigngroup.ca.';}
  catch{copyText.hidden=false;copyText.focus();copyText.select();feedback.textContent='Select and copy the details below, then email them to peter@pidesigngroup.ca.';}
});
form.addEventListener('input',()=>{prepared.hidden=true;});
setupImageErrors();setupReveals();
// Opening motion is CSS-driven before first paint.
document.addEventListener('pi:motion',()=>{settle();});
window.addEventListener('pagehide',()=>{++request;clearTimeout(hoverTimer);settle();});

