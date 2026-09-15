import { animate, mode, read, root, setupImageErrors, setupReveals, write } from './motion';
import { imageLabel } from '../data/image-credit';
import type { ProjectImage } from '../data/project-details';

root.dataset.enhanced = 'true';
setupImageErrors();
setupReveals();

const backLinks = document.querySelectorAll<HTMLAnchorElement>('[data-back-projects]');
try {
  const saved = JSON.parse(read('pi-project-return','session') || 'null');
  if (saved) {
    const url = new URL(saved.url, location.origin);
    backLinks.forEach(back => {
      const homepage = new URL(back.href);
      if (url.origin === location.origin && url.pathname === homepage.pathname) {
        back.href = url.href;
        back.addEventListener('click', () => write('pi-project-resume', 'true', 'session'));
      }
    });
  }
} catch {}

const gallery = JSON.parse(document.querySelector('#project-gallery-data')!.textContent!) as ProjectImage[];
const dialog = document.querySelector<HTMLDialogElement>('#image-viewer')!;
const stage = document.querySelector<HTMLElement>('#viewer-stage')!;
const picture = document.querySelector<HTMLImageElement>('#viewer-image')!;
const caption = document.querySelector<HTMLElement>('#viewer-caption')!;
const medium = document.querySelector<HTMLElement>('#viewer-medium')!;
const counter = document.querySelector<HTMLElement>('#viewer-count')!;
const status = document.querySelector<HTMLElement>('#viewer-status')!;
const closeButton = document.querySelector<HTMLButtonElement>('#viewer-close')!;
const zoomButton = document.querySelector<HTMLButtonElement>('#viewer-zoom')!;
const mediaButtons = document.querySelectorAll<HTMLButtonElement>('[data-viewer-media]');
const lastMediaIndex = { images:gallery.findIndex(item=>item.medium!=='drawing'),drawings:gallery.findIndex(item=>item.medium==='drawing') };
let version = 0;
let requested = 0;
let selected = 0;
let trigger: HTMLElement | null = null;
let lockedOverflow = '';
let phase: 'closed' | 'opening' | 'open' | 'closing' = 'closed';
let source: HTMLElement | null = null;
let hasImage = false;
let zoomed = false;
let pan = { x:0,y:0 };
let pointer: {id:number;x:number;y:number;originX:number;originY:number} | null = null;
const decoded = new Map<string,Promise<HTMLImageElement>>();
const load = (src:string) => {
  if (!decoded.has(src)) {
    const img = new Image(); img.src = src;
    const promise = img.decode().then(()=>img).catch(error=>{decoded.delete(src);throw error;});
    decoded.set(src,promise);
  }
  return decoded.get(src)!;
};
const clearLayers = () => stage.querySelectorAll('.viewer-previous-image').forEach(image=>image.remove());
const motionAnimations = new Set<Animation>();
const play = (element:Element, frames:Keyframe[], duration:number) => {
  const animation = animate(element,frames,duration);
  if (animation) {
    motionAnimations.add(animation);
    void animation.finished.finally(()=>motionAnimations.delete(animation)).catch(()=>{});
  }
  return animation;
};

// The native dialog owns interaction and focus. A separate surface lets the
// actual photograph move without scaling or fading the toolbar and caption.
const viewerStyle = document.createElement('style');
viewerStyle.textContent = '.image-viewer[data-viewer-motion]{background:transparent!important}.image-viewer[data-viewer-motion]::backdrop{background:transparent}.image-viewer[data-viewer-motion] .viewer-caption,.image-viewer[data-viewer-motion] .viewer-stage{position:relative;z-index:1}';
document.head.append(viewerStyle);
dialog.dataset.viewerMotion = '';
const surface = document.createElement('div');
surface.className = 'viewer-motion-surface';
surface.setAttribute('aria-hidden','true');
surface.style.cssText = 'position:absolute;inset:0;z-index:0;pointer-events:none;background:#101211';
dialog.prepend(surface);
const controls = [...dialog.querySelectorAll<HTMLElement>('.viewer-toolbar,.viewer-caption,.viewer-arrow')];
const surfaceColor = (item:ProjectImage) => item.medium === 'drawing' ? '#eff1ee' : '#101211';
type Bounds = { x:number;y:number;width:number;height:number };
type ImagePose = { image:Bounds;clip:Bounds };
let proxy: { element:HTMLDivElement;image:HTMLImageElement;src:string } | null = null;
const bounds = (rect:DOMRect):Bounds => ({x:rect.x,y:rect.y,width:rect.width,height:rect.height});
const intersect = (a:Bounds,b:Bounds):Bounds => {
  const x=Math.max(a.x,b.x),y=Math.max(a.y,b.y);
  return {x,y,width:Math.max(0,Math.min(a.x+a.width,b.x+b.width)-x),height:Math.max(0,Math.min(a.y+a.height,b.y+b.height)-y)};
};
const viewport = ():Bounds => ({x:0,y:0,width:innerWidth,height:innerHeight});
const imagePose = (img:HTMLImageElement):ImagePose => {
  const style=getComputedStyle(img),rect=img.getBoundingClientRect();
  const left=parseFloat(style.paddingLeft)+parseFloat(style.borderLeftWidth);
  const top=parseFloat(style.paddingTop)+parseFloat(style.borderTopWidth);
  const box={x:rect.x+left,y:rect.y+top,width:rect.width-left-parseFloat(style.paddingRight)-parseFloat(style.borderRightWidth),height:rect.height-top-parseFloat(style.paddingBottom)-parseFloat(style.borderBottomWidth)};
  const scale=(style.objectFit==='cover'?Math.max:Math.min)(box.width/img.naturalWidth,box.height/img.naturalHeight);
  const width=img.naturalWidth*scale,height=img.naturalHeight*scale;
  const position=style.objectPosition.split(' ');
  const offset=(space:number,value:string|undefined)=>value?.endsWith('px')?parseFloat(value):space*(parseFloat(value || '50')/100);
  const image={x:box.x+offset(box.width-width,position[0]),y:box.y+offset(box.height-height,position[1]),width,height};
  return {image,clip:intersect(intersect(image,box),viewport())};
};
const sameImage = (img:HTMLImageElement,item:ProjectImage) => !!img.currentSrc && new URL(img.currentSrc,location.href).href === new URL(item.src,location.href).href;
const sourcePose = (item:ProjectImage):ImagePose|null => {
  const img=source?.querySelector<HTMLImageElement>('img');
  if (!source?.isConnected || !img || !img.complete || !img.naturalWidth || !sameImage(img,item) || getComputedStyle(img).visibility==='hidden') return null;
  const pose=imagePose(img);
  pose.clip=intersect(pose.clip,bounds(source.getBoundingClientRect()));
  return pose.clip.width>=24 && pose.clip.height>=24 ? pose : null;
};
const clipPath = (rect:Bounds) => `inset(${rect.y}px ${Math.max(0,innerWidth-rect.x-rect.width)}px ${Math.max(0,innerHeight-rect.y-rect.height)}px ${rect.x}px)`;
const proxyPose = ():ImagePose|null => {
  if (!proxy) return null;
  const values=getComputedStyle(proxy.element).clipPath.match(/-?\d+(?:\.\d+)?/g)?.map(Number);
  if (!values?.length || values.length>4) return null;
  const [top,right=top,bottom=top,left=right]=values;
  return {image:bounds(proxy.image.getBoundingClientRect()),clip:{x:left,y:top,width:innerWidth-right-left,height:innerHeight-top-bottom}};
};
const clearMotion = () => {
  motionAnimations.forEach(animation=>animation.cancel()); motionAnimations.clear();
  proxy?.element.remove(); proxy=null;
  picture.style.visibility=hasImage?'':'hidden'; clearLayers();
};
const moveImage = (item:ProjectImage,from:ImagePose,to:ImagePose,duration:number) => {
  const element=document.createElement('div'),image=document.createElement('img');
  element.className='viewer-motion-proxy';element.setAttribute('aria-hidden','true');
  element.style.cssText='position:fixed;inset:0;z-index:3;pointer-events:none;overflow:hidden';
  element.style.clipPath=clipPath(to.clip);
  image.src=item.src;image.alt='';image.draggable=false;
  image.style.cssText=`position:absolute;left:${to.image.x}px;top:${to.image.y}px;width:${to.image.width}px;height:${to.image.height}px;max-width:none;object-fit:fill;transform-origin:0 0;will-change:transform`;
  element.append(image);dialog.append(element);proxy={element,image,src:item.src};
  picture.style.visibility='hidden';
  const dx=from.image.x-to.image.x,dy=from.image.y-to.image.y,scale=from.image.width/to.image.width;
  play(element,[{clipPath:clipPath(from.clip)},{clipPath:clipPath(to.clip)}],duration);
  return play(image,[{transform:`translate(${dx}px,${dy}px) scale(${scale})`},{transform:'translate(0,0) scale(1)'}],duration);
};
const fadeChrome = (from:number,to:number,duration:number) => {
  surface.style.opacity=String(to);
  const result=play(surface,[{opacity:from},{opacity:to}],duration);
  controls.forEach(element=>{
    const current=Number(getComputedStyle(element).opacity);
    element.style.opacity=String(to);
    play(element,[{opacity:to===0?current:from},{opacity:to}],duration);
  });
  return result;
};
const transform = () => picture.style.transform = zoomed ? `translate(${pan.x}px,${pan.y}px) scale(2)` : '';
const setZoom = (next:boolean) => {
  if(next && !hasImage) return;
  if(proxy){clearMotion();if(phase==='opening')phase='open';}
  if(pointer && stage.hasPointerCapture(pointer.id)) stage.releasePointerCapture(pointer.id);
  pointer=null;dialog.removeAttribute('data-dragging');
  zoomed = next; pan = {x:0,y:0};
  dialog.toggleAttribute('data-zoomed',zoomed);
  zoomButton.setAttribute('aria-pressed',String(zoomed));
  zoomButton.setAttribute('aria-label',zoomed?'Zoom out':'Zoom in');
  transform();
};
const finishClose = () => {
  clearMotion(); phase='closed';hasImage=false; dialog.close(); root.style.overflow=lockedOverflow;
  setZoom(false);
  (trigger?.isConnected ? trigger : document.querySelector<HTMLElement>('[data-back-projects]'))?.focus({preventScroll:true});
  status.textContent='';picture.style.visibility='hidden';
};
const close = () => {
  if (!dialog.open || phase==='closing') return;
  const ticket=++version,item=gallery[selected],wasZoomed=zoomed;
  const current=proxyPose() || (hasImage ? imagePose(picture) : null);
  const opacity=Number(getComputedStyle(surface).opacity);
  const target=sourcePose(item);
  clearMotion();if(!wasZoomed)setZoom(false);phase='closing';
  const moving=mode()==='full' && !wasZoomed && current && target ? moveImage(item,current,target,260) : null;
  const fading=fadeChrome(opacity,0,moving?260:180);
  if (!moving) {
    picture.style.visibility=current?'':'hidden';
    play(picture,[{opacity:1},{opacity:0}],180);
  }
  const finish = () => {
    if(ticket===version && phase==='closing') finishClose();
  };
  const ending=moving || fading;
  if(ending) void ending.finished.then(finish).catch(()=>{}); else finish();
};
const show = async (next:number, origin?:HTMLElement) => {
  const ticket = ++version;
  requested = (next + gallery.length) % gallery.length;
  const item = gallery[requested];
  const nextIndex = requested;
  const opening = !dialog.open || phase==='closing';
  const continuing=proxy?.src===item.src?proxyPose():null;
  const surfaceOpacity=dialog.open?Number(getComputedStyle(surface).opacity):0;
  if (!dialog.open) {
    hasImage=false;
    caption.textContent='';medium.textContent='';counter.textContent='';
    dialog.dataset.medium=item.medium;
    trigger = origin || document.activeElement as HTMLElement;
    source = origin?.matches('[data-gallery-index]') ? origin : null;
    lockedOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    surface.style.opacity='0';controls.forEach(element=>element.style.opacity='0');
    dialog.showModal(); closeButton.focus({preventScroll:true});
    picture.style.visibility = 'hidden';
  } else if (origin) {
    trigger=origin;source=origin.matches('[data-gallery-index]')?origin:null;
  }
  const hadImage=hasImage;
  clearMotion();
  if (!hadImage) picture.style.visibility='hidden';
  if(opening) {
    phase='opening';surface.style.background=surfaceColor(item);
    fadeChrome(surfaceOpacity,1,240);
  } else phase='open';
  status.textContent = '';
  const loading = window.setTimeout(()=>{if(ticket===version)status.textContent='Loading image…';},250);
  try {
    await load(item.src);
    if (ticket !== version || !dialog.open) return;
    clearLayers();
    const previous = !opening && hadImage && picture.src && mode() !== 'off' ? picture.cloneNode() as HTMLImageElement : null;
    if (previous) {
      previous.removeAttribute('id'); previous.alt=''; previous.className='viewer-previous-image';
      previous.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none';
      stage.prepend(previous);
    }
    setZoom(false); selected = nextIndex;hasImage=true;
    picture.src = item.src; picture.alt = item.caption; picture.style.visibility='';
    dialog.dataset.medium = item.medium;
    surface.style.background=surfaceColor(item);
    caption.textContent = item.caption;
    medium.textContent = imageLabel(item);
    counter.textContent = `${selected+1} / ${gallery.length}`;
    const mediaKind=item.medium==='drawing'?'drawings':'images';
    lastMediaIndex[mediaKind]=selected;
    mediaButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.viewerMedia===mediaKind)));
    status.textContent='';
    if (opening) {
      const from=continuing || sourcePose(item);
      const moving=mode()==='full' && from ? moveImage(item,from,imagePose(picture),420) : play(picture,[{opacity:0},{opacity:1}],240);
      const finish=()=>{
        if(ticket!==version || phase!=='opening') return;
        proxy?.element.remove();proxy=null;picture.style.visibility='';phase='open';
      };
      if(moving) void moving.finished.then(finish).catch(()=>{}); else finish();
    } else {
      play(picture,[{opacity:0},{opacity:1}],240);
      if (previous) {
        const fading = play(previous,[{opacity:1},{opacity:0}],240);
        void fading?.finished.finally(()=>previous.remove()).catch(()=>{});
      }
    }
    // Decode neighbouring images after the visible image has settled.
    [selected-1,selected+1].forEach(index=>void load(gallery[(index+gallery.length)%gallery.length].src).catch(()=>{}));
  } catch {
    if (ticket===version) { requested=selected; phase='open';status.textContent='This image could not be loaded. Try another image or close the gallery.'; }
  } finally { clearTimeout(loading); }
};
// The opening photograph is a small, user-controlled carousel. Its frame and
// project metadata stay fixed; incoming media is decoded before it is shown.
const heroFigure=document.querySelector<HTMLElement>('.primary-figure');
const heroImage=heroFigure?.querySelector<HTMLImageElement>('img');
const heroLink=heroFigure?.querySelector<HTMLAnchorElement>('[data-gallery-index]');
const heroCount=document.querySelector<HTMLElement>('#project-hero-count');
const heroCaption=heroFigure?.querySelector<HTMLElement>('figcaption');
// Reserve the longest caption at the current width; this keeps the arrows and
// all following content still when captions wrap differently on small screens.
const measureHeroCaption=()=>{
  if(!heroCaption || !heroFigure) return;
  const measuring=heroCaption.cloneNode(true) as HTMLElement;
  measuring.setAttribute('aria-hidden','true');
  measuring.style.cssText='position:absolute;left:0;right:0;visibility:hidden;pointer-events:none;min-height:0;height:auto';
  const text=measuring.querySelector<HTMLElement>('[data-figure-caption]');
  const label=measuring.querySelector<HTMLElement>('.image-medium');
  if(!text || !label) return;
  heroFigure.append(measuring);
  let height=0;
  for(const item of gallery){
    text.textContent=item.caption;
    label.textContent=imageLabel(item);
    height=Math.max(height,measuring.getBoundingClientRect().height);
  }
  measuring.remove();
  const value=`${Math.ceil(height)}px`;
  if(heroFigure.style.getPropertyValue('--hero-caption-height')!==value) heroFigure.style.setProperty('--hero-caption-height',value);
};
if(heroLink && heroCaption){
  const captionObserver=new ResizeObserver(measureHeroCaption);
  captionObserver.observe(heroLink);captionObserver.observe(heroCaption);
  void document.fonts.ready.then(measureHeroCaption);
}
let heroVersion=0,heroRequested=Number(heroLink?.dataset.galleryIndex || 0),heroSelected=heroRequested;
const heroAnimations=new Set<Animation>();
const clearHeroMotion=()=>{
  heroAnimations.forEach(animation=>animation.cancel());heroAnimations.clear();
  heroLink?.querySelectorAll('.hero-previous-image').forEach(image=>image.remove());
};
const heroStatus=document.querySelector<HTMLElement>('#project-hero-status') || document.createElement('span');
if(!heroStatus.isConnected){
  heroStatus.className='project-hero-status';heroStatus.setAttribute('role','status');
  heroStatus.style.cssText='font-size:13px;color:var(--muted);display:block';
  if(heroCount) heroCount.parentElement?.append(heroStatus);
}
const changeHero=async(next:number)=>{
  if(!heroFigure || !heroImage || !heroLink || !heroCount) return;
  const ticket=++heroVersion;
  heroRequested=(next+gallery.length)%gallery.length;
  const nextIndex=heroRequested,item=gallery[nextIndex];
  heroStatus.textContent='';
  const loading=window.setTimeout(()=>{if(ticket===heroVersion)heroStatus.textContent='Loading image…';},250);
  try {
    await load(item.src);
    if(ticket!==heroVersion) return;
    clearHeroMotion();
    const previous=mode()!=='off'?heroImage.cloneNode() as HTMLImageElement:null;
    if(previous){
      previous.removeAttribute('data-primary-project');previous.alt='';previous.className='hero-previous-image';
      previous.style.cssText=`position:absolute;inset:0;width:100%;height:100%;object-fit:${gallery[heroSelected].medium==='drawing'?'contain':'cover'};pointer-events:none;z-index:1`;
      heroLink.append(previous);
    }
    heroSelected=nextIndex;
    heroImage.src=item.src;heroImage.alt=item.caption;heroImage.width=item.width;heroImage.height=item.height;
    heroImage.style.objectFit=item.medium==='drawing'?'contain':'cover';
    heroFigure.classList.toggle('is-drawing',item.medium==='drawing');
    heroLink.href=item.src;heroLink.dataset.galleryIndex=String(nextIndex);heroLink.setAttribute('aria-label',`View image: ${item.caption}`);
    const heroCaption=heroFigure.querySelector<HTMLElement>('[data-figure-caption]');
    if(heroCaption) heroCaption.textContent=item.caption;
    const heroMedium=heroFigure.querySelector<HTMLElement>('.image-medium');
    if(heroMedium) heroMedium.textContent=imageLabel(item);
    heroCount.textContent=`${String(nextIndex+1).padStart(2,'0')} / ${String(gallery.length).padStart(2,'0')}`;
    heroStatus.textContent='';
    const incoming=animate(heroImage,[{opacity:0},{opacity:1}],240);
    if(incoming){heroAnimations.add(incoming);void incoming.finished.finally(()=>heroAnimations.delete(incoming)).catch(()=>{});}
    if(previous){
      const outgoing=animate(previous,[{opacity:1},{opacity:0}],240);
      if(outgoing){heroAnimations.add(outgoing);void outgoing.finished.finally(()=>{heroAnimations.delete(outgoing);previous.remove();}).catch(()=>{});}
      else previous.remove();
    }
  } catch {
    if(ticket===heroVersion){heroRequested=heroSelected;heroStatus.textContent='This image could not be loaded. Try another image.';}
  } finally {clearTimeout(loading);}
};
document.querySelector('#project-hero-previous')?.addEventListener('click',()=>void changeHero(heroRequested-1));
document.querySelector('#project-hero-next')?.addEventListener('click',()=>void changeHero(heroRequested+1));

document.querySelectorAll<HTMLAnchorElement>('[data-gallery-index]').forEach(anchor=>anchor.addEventListener('click',event=>{
  if(event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if(anchor===heroLink){++heroVersion;heroRequested=heroSelected;clearHeroMotion();heroStatus.textContent='';}
  event.preventDefault(); void show(Number(anchor.dataset.galleryIndex),anchor);
}));
document.querySelector('[data-open-gallery]')?.addEventListener('click',event=>void show(0,event.currentTarget as HTMLElement));
closeButton.addEventListener('click',close);
dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
document.querySelector('#viewer-previous')!.addEventListener('click',()=>void show(requested-1));
document.querySelector('#viewer-next')!.addEventListener('click',()=>void show(requested+1));
mediaButtons.forEach(button=>button.addEventListener('click',()=>{
  const kind=button.dataset.viewerMedia as keyof typeof lastMediaIndex;
  if(lastMediaIndex[kind]>=0) void show(lastMediaIndex[kind]);
}));
dialog.addEventListener('keydown',event=>{
  if(event.key==='Tab'){
    const controls=[...dialog.querySelectorAll<HTMLButtonElement>('button:not([disabled])')];
    const first=controls[0],last=controls[controls.length-1];
    if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
  }
  if(event.key==='ArrowRight' || event.key==='ArrowLeft'){event.preventDefault();void show(requested+(event.key==='ArrowRight'?1:-1));}
});
zoomButton.addEventListener('click',()=>setZoom(!zoomed));
stage.addEventListener('dblclick',()=>setZoom(!zoomed));
stage.addEventListener('pointerdown',event=>{
  if(event.button) return;
  pointer={id:event.pointerId,x:event.clientX,y:event.clientY,originX:pan.x,originY:pan.y};
  if(zoomed){stage.setPointerCapture(event.pointerId);dialog.setAttribute('data-dragging','');}
});
stage.addEventListener('pointermove',event=>{
  if(!pointer || !zoomed) return;
  const scale=Math.min(stage.clientWidth/picture.naturalWidth,stage.clientHeight/picture.naturalHeight);
  const limitX=Math.max(0,(picture.naturalWidth*scale*2-stage.clientWidth)/2);
  const limitY=Math.max(0,(picture.naturalHeight*scale*2-stage.clientHeight)/2);
  pan.x=Math.max(-limitX,Math.min(limitX,pointer.originX+event.clientX-pointer.x));
  pan.y=Math.max(-limitY,Math.min(limitY,pointer.originY+event.clientY-pointer.y));transform();
});
const release = (event:PointerEvent) => {
  if(pointer && !zoomed && event.type!=='pointercancel'){
    const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;
    if(Math.abs(dx)>70 && Math.abs(dx)>Math.abs(dy)*1.8) void show(requested+(dx<0?1:-1));
  }
  pointer=null;dialog.removeAttribute('data-dragging');
};
stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);
document.addEventListener('pi:motion',()=>{
  clearHeroMotion();setZoom(false);
  if(phase==='closing') finishClose();
  else {clearMotion();if(hasImage)phase='open';}
});
window.addEventListener('resize',()=>{
  setZoom(false);
  if(phase==='closing') finishClose();
  else {clearMotion();if(hasImage)phase='open';}
});
window.addEventListener('pagehide',()=>{
  ++version;++heroVersion;clearHeroMotion();
  if(dialog.open){clearMotion();dialog.close();root.style.overflow=lockedOverflow;phase='closed';hasImage=false;}
});
