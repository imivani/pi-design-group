import { animate, mode } from './motion';

interface Detail {
  id: string;
  title: string;
  project: string;
  href: string;
  drawing: string;
  drawingAlt: string;
  copy: string;
}

const section = document.querySelector<HTMLElement>('#why[data-detail-active]');
const data = document.querySelector<HTMLScriptElement>('#home-details-data');
if (section && data) {
  const details = JSON.parse(data.textContent || '[]') as Detail[];
  const plan = section.querySelector<HTMLImageElement>('#detail-plan-image')!;
  const planLink = section.querySelector<HTMLAnchorElement>('.detail-plan-link')!;
  const copy = section.querySelector<HTMLElement>('#detail-plan-copy')!;
  const detailTitle = section.querySelector<HTMLElement>('#detail-plan-title')!;
  const detailCounter = section.querySelector<HTMLElement>('#detail-plan-counter')!;
  const projectName = section.querySelector<HTMLElement>('[data-detail-project]')!;
  const projectLink = section.querySelector<HTMLAnchorElement>('#detail-project-link')!;
  const status = section.querySelector<HTMLElement>('#detail-plan-status')!;
  const selectors = [...section.querySelectorAll<HTMLButtonElement>('[data-detail-select]')];
  const drawingLinks = [...section.querySelectorAll<HTMLAnchorElement>('[data-open-drawing]')];
  const viewer = document.querySelector<HTMLDialogElement>('#detail-drawing-viewer')!;
  const viewerImage = document.querySelector<HTMLImageElement>('#detail-viewer-image')!;
  const viewerTitle = document.querySelector<HTMLElement>('#detail-viewer-title')!;
  const viewerCaption = document.querySelector<HTMLElement>('#detail-viewer-caption')!;
  const viewerStatus = document.querySelector<HTMLElement>('#detail-viewer-status')!;
  const stage = document.querySelector<HTMLElement>('#detail-viewer-stage')!;
  const zoomButton = document.querySelector<HTMLButtonElement>('#detail-viewer-zoom')!;
  const closeButton = document.querySelector<HTMLButtonElement>('#detail-viewer-close')!;
  let selected = details.find(detail => detail.id === section.dataset.detailActive)!;
  let request = 0;
  let viewerRequest = 0;
  let hoverTimer: ReturnType<typeof setTimeout> | undefined;
  let previousFocus: HTMLElement | null = null;
  let savedOverflow = '';
  let viewerAnimation: Animation | null = null;
  let drawingAnimation: Animation | null = null;
  let outgoing: HTMLImageElement | null = null;
  let closing = false;
  let drag: { x: number; y: number; left: number; top: number; pointer: number } | null = null;

  const decode = async (src: string) => {
    const image = new Image();
    image.src = src;
    await image.decode();
    if (!image.naturalWidth) throw new Error('Drawing unavailable');
  };
  const clearDrawingTransition = () => {
    drawingAnimation?.cancel(); drawingAnimation = null;
    outgoing?.remove(); outgoing = null;
  };

  async function selectDetail(id: string) {
    const detail = details.find(item => item.id === id);
    if (!detail) return;
    // A new intent invalidates an earlier decode, even when returning to the current image.
    const token = ++request;
    clearTimeout(hoverTimer);
    if (detail.id === selected.id && plan.complete && plan.naturalWidth) {
      planLink.removeAttribute('aria-busy'); status.textContent = ''; return;
    }
    planLink.setAttribute('aria-busy', 'true');
    status.textContent = '';
    try { await decode(detail.drawing); }
    catch {
      if (token !== request) return;
      planLink.removeAttribute('aria-busy');
      status.textContent = 'This drawing could not load. Select the detail again to retry.';
      return;
    }
    if (token !== request) return;
    clearDrawingTransition();
    if (mode() !== 'off' && plan.naturalWidth && detail.drawing !== selected.drawing) {
      outgoing = plan.cloneNode(false) as HTMLImageElement;
      outgoing.removeAttribute('id'); outgoing.alt = ''; outgoing.setAttribute('aria-hidden', 'true');
      Object.assign(outgoing.style, { position: 'absolute', inset: '0', pointerEvents: 'none' });
      plan.after(outgoing);
    }
    selected = detail;
    plan.src = detail.drawing; plan.alt = detail.drawingAlt; plan.style.removeProperty('opacity');
    planLink.classList.remove('media-unavailable');
    copy.textContent = detail.copy;
    detailTitle.textContent = detail.title;
    const detailNumber = details.indexOf(detail) + 1;
    detailCounter.textContent = String(detailNumber).padStart(2, '0') + ' / ' + String(details.length).padStart(2, '0');
    detailCounter.setAttribute('aria-label', `Detail ${detailNumber} of ${details.length}`);
    projectName.textContent = detail.project;
    projectLink.href = detail.href;
    drawingLinks.forEach(link => { link.href = detail.href + '#drawings-title'; });
    planLink.setAttribute('aria-label', 'Open ' + detail.project + ' drawing');
    section!.dataset.detailActive = detail.id;
    selectors.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.detailSelect === detail.id)));
    planLink.removeAttribute('aria-busy');
    status.textContent = '';
    if (outgoing) {
      const old = outgoing;
      drawingAnimation = animate(old, [{ opacity: 1 }, { opacity: 0 }], 280);
      void drawingAnimation?.finished.then(() => { old.remove(); if (outgoing === old) outgoing = null; }).catch(() => {});
    }
    animate(copy, [{ opacity: .25 }, { opacity: 1 }], 200);
  }

  for (const button of selectors) {
    button.disabled = false;
    button.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse' || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => void selectDetail(button.dataset.detailSelect!), 110);
    });
    button.addEventListener('pointerleave', () => clearTimeout(hoverTimer));
    button.addEventListener('focus', () => void selectDetail(button.dataset.detailSelect!));
    button.addEventListener('click', () => void selectDetail(button.dataset.detailSelect!));
    button.addEventListener('keydown', event => {
      const current = selectors.indexOf(button);
      const next = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? (current + 1) % selectors.length
        : event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? (current + selectors.length - 1) % selectors.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? selectors.length - 1 : -1;
      if (next < 0) return;
      event.preventDefault(); selectors[next].focus({ preventScroll: true });
    });
  }

  function setZoom(zoomed: boolean) {
    viewer.dataset.zoom = String(zoomed);
    zoomButton.setAttribute('aria-pressed', String(zoomed));
    zoomButton.setAttribute('aria-label', zoomed ? 'Fit drawing to screen' : 'Zoom into drawing');
    zoomButton.querySelector('span')!.textContent = zoomed ? 'Fit Drawing' : 'Zoom In';
    if (zoomed) {
      stage.scrollLeft = (stage.scrollWidth - stage.clientWidth) / 2;
      stage.scrollTop = (stage.scrollHeight - stage.clientHeight) / 2;
    } else { stage.scrollLeft = 0; stage.scrollTop = 0; }
  }
  function finishClose() {
    viewerAnimation?.cancel(); viewerAnimation = null;
    viewer.close(); closing = false;
    document.documentElement.style.overflow = savedOverflow;
    setZoom(false);
    drag = null; delete viewer.dataset.dragging;
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
  }
  function closeViewer() {
    if (!viewer.open || closing) return;
    ++viewerRequest; closing = true;
    viewerAnimation?.cancel();
    viewerAnimation = animate(viewer, [{ opacity: 1 }, { opacity: 0 }], 160);
    if (!viewerAnimation) { finishClose(); return; }
    void viewerAnimation.finished.then(finishClose).catch(() => {});
  }
  async function openViewer(invoker: HTMLElement) {
    if (viewer.open) return;
    const token = ++viewerRequest;
    const detail = selected;
    closing = false;
    previousFocus = invoker;
    savedOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    viewerTitle.textContent = detail.project;
    viewerCaption.textContent = detail.copy;
    viewerStatus.textContent = 'Loading drawing…';
    viewerImage.hidden = true;
    zoomButton.disabled = true;
    viewerImage.alt = detail.drawingAlt;
    setZoom(false);
    viewer.showModal(); closeButton.focus({ preventScroll: true });
    viewerAnimation?.cancel();
    viewerAnimation = animate(viewer, [{ opacity: 0 }, { opacity: 1 }], 180);
    try {
      await decode(detail.drawing);
      if (token !== viewerRequest || !viewer.open) return;
      viewerImage.src = detail.drawing;
      viewerImage.hidden = false;
      viewerStatus.textContent = '';
      viewerImage.style.removeProperty('opacity');
      stage.classList.remove('media-unavailable');
      animate(viewerImage, [{ opacity: 0 }, { opacity: 1 }], 180);
      zoomButton.disabled = false;
    } catch {
      if (token !== viewerRequest || !viewer.open) return;
      zoomButton.disabled = true;
      viewerStatus.textContent = 'The drawing could not load. Close this view and open the drawing again to retry.';
    }
  }

  drawingLinks.forEach(link => link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); void openViewer(link);
  }));
  closeButton.addEventListener('click', closeViewer);
  viewer.addEventListener('cancel', event => { event.preventDefault(); closeViewer(); });
  zoomButton.addEventListener('click', () => setZoom(viewer.dataset.zoom !== 'true'));
  viewer.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusable = [...viewer.querySelectorAll<HTMLElement>('button:not([disabled]), [tabindex="0"]')];
    const first = focusable[0]; const last = focusable.at(-1)!;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  stage.addEventListener('pointerdown', event => {
    if (viewer.dataset.zoom !== 'true' || event.pointerType !== 'mouse' || event.button !== 0) return;
    drag = { x: event.clientX, y: event.clientY, left: stage.scrollLeft, top: stage.scrollTop, pointer: event.pointerId };
    stage.setPointerCapture(event.pointerId); viewer.dataset.dragging = 'true'; event.preventDefault();
  });
  stage.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.pointer) return;
    stage.scrollLeft = drag.left - (event.clientX - drag.x);
    stage.scrollTop = drag.top - (event.clientY - drag.y);
  });
  const endDrag = () => { drag = null; delete viewer.dataset.dragging; };
  stage.addEventListener('pointerup', endDrag); stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('lostpointercapture', endDrag);
  document.addEventListener('pi:motion', () => {
    if (mode() === 'full') return;
    clearDrawingTransition();
    if (closing) finishClose();
    else { viewerAnimation?.cancel(); viewerAnimation = null; }
  });
  window.addEventListener('pagehide', () => {
    ++request; ++viewerRequest; clearTimeout(hoverTimer); clearDrawingTransition();
    if (viewer.open) finishClose();
  });
}
