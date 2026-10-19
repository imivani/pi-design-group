import { animate, mode, root, setupImageErrors, setupReveals } from './motion';
import { arrive, spring, structure } from './spring';

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
const submit = form.querySelector<HTMLButtonElement>('.inquiry-submit')!;
const submitLabel = document.querySelector<HTMLElement>('#inquiry-submit-label')!;
const spinner = submit.querySelector<SVGElement>('.inquiry-spinner')!;
const error = document.querySelector<HTMLElement>('#inquiry-error')!;
const sent = document.querySelector<HTMLElement>('#inquiry-sent')!;
const formParts = [form.querySelector<HTMLElement>('.inquiry-choices')!, fields];
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
const draftEmail = (automatic:boolean, message:string) => {
  prepared.hidden=false;feedback.textContent=message;
  track(animate(prepared,[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],360));
  if(automatic)window.location.href=emailLink.href;
};
let spin: ReturnType<typeof spring> = null;
const sending = (on:boolean) => {
  submit.disabled=on;submit.dataset.sending=String(on);submitLabel.textContent=on?'Sending…':'Send Inquiry';
  spin?.stop();spin=on?spring(spinner,{rotate:[0,360]},{duration:.9,ease:'linear',repeat:Infinity}):null;
};
const showSent = async (value:(key:string)=>string) => {
  document.querySelector('#inquiry-sent-name')!.textContent=value('name').split(/\s+/)[0];
  document.querySelector('#inquiry-sent-email')!.textContent=value('email');
  document.querySelector('#inquiry-sent-type')!.textContent=value('projectType');
  document.querySelector('#inquiry-sent-location')!.textContent=value('location');
  await spring(formParts,{opacity:0,y:-8},structure)?.finished;
  formParts.forEach(part=>part.hidden=true);prompt.hidden=true;sent.hidden=false;
  document.querySelector<HTMLElement>('#inquiry-sent-title')!.focus({preventScroll:true});
  sent.scrollIntoView({block:'nearest',behavior:mode()==='full'?'smooth':'auto'});
  const [ring,tick]=sent.querySelectorAll('.inquiry-sent-mark *');
  spring(sent.querySelector('.inquiry-sent-mark')!,{scale:[.6,1],opacity:[0,1]},{type:'spring',visualDuration:.35,bounce:.35});
  spring(ring,{strokeDashoffset:[1,0]},{duration:.5,ease:[.22,1,.36,1]});
  spring(tick,{strokeDashoffset:[1,0]},{duration:.35,delay:.3,ease:[.22,1,.36,1]});
  arrive([...sent.children].slice(1));
};
form.addEventListener('submit',async event=>{
  event.preventDefault();if(submit.disabled||!form.reportValidity())return;
  const data=new FormData(form);
  const value=(key:string)=>String(data.get(key)||'').trim();
  const subject=`Landscape inquiry: ${value('projectType')} in ${value('location')}`;
  draft=`Hello Peter,\n\n${value('message')}\n\nProject type: ${value('projectType')}\nProject location: ${value('location')}\n\nName: ${value('name')}\nOrganization: ${value('organization')||'Not provided'}\nEmail: ${value('email')}`;
  emailLink.href=`mailto:peter@pidesigngroup.ca?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(draft)}`;copyText.value=draft;
  error.hidden=true;prepared.hidden=true;sending(true);
  let response:Response|null=null;
  try{response=await fetch(`${import.meta.env.BASE_URL}api/contact`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(data))});}catch{}
  sending(false);
  if(response?.ok){void showSent(value);return;}
  if(response?.status===400){
    error.textContent='Some details need another look. Check each field, then send again.';error.hidden=false;
    spring(error,{opacity:[0,1],y:[4,0]});return;
  }
  // No sending service on this host (local preview, or the email key isn't set yet): fall back to an email draft.
  if(response&&[404,405,503].includes(response.status)){draftEmail(true,'Your email draft is ready. If your email app didn’t open, copy the details and email Peter directly.');return;}
  draftEmail(false,'We couldn’t send your message just now. Your details are ready to email to Peter instead.');
});
document.querySelector('#inquiry-again')!.addEventListener('click',()=>{
  form.reset();selected='';fields.dataset.open='false';fields.inert=true;
  sent.hidden=true;formParts.forEach(part=>{part.hidden=false;part.style.opacity='';part.style.transform='';});prompt.hidden=false;
  arrive(formParts,8);void preview(choices[0].id);radios[0].focus();
});
document.querySelector('#inquiry-copy')!.addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(draft);feedback.textContent='Inquiry details copied. Paste them into an email to peter@pidesigngroup.ca.';}
  catch{copyText.hidden=false;copyText.focus();copyText.select();feedback.textContent='Select and copy the details below, then email them to peter@pidesigngroup.ca.';}
});
form.addEventListener('input',()=>{prepared.hidden=true;error.hidden=true;});
setupImageErrors();setupReveals();
// Opening motion is CSS-driven before first paint.
document.addEventListener('pi:motion',()=>{settle();});
window.addEventListener('pagehide',()=>{++request;clearTimeout(hoverTimer);settle();});

