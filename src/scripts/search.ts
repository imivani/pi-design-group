import { animate, mode } from './motion';

const dialog = document.querySelector<HTMLDialogElement>('#site-search-dialog');
if (dialog) {
  const input = dialog.querySelector<HTMLInputElement>('#site-search-input')!;
  const form = dialog.querySelector<HTMLFormElement>('.site-search-form')!;
  const list = dialog.querySelector<HTMLElement>('#site-search-results')!;
  const links = Array.from(list.querySelectorAll<HTMLAnchorElement>('[data-search-project]'));
  const title = dialog.querySelector<HTMLElement>('#site-search-results-title')!;
  const count = dialog.querySelector<HTMLElement>('#site-search-count')!;
  const clear = dialog.querySelector<HTMLButtonElement>('#site-search-clear')!;
  const empty = dialog.querySelector<HTMLElement>('#site-search-empty')!;
  const announcement = dialog.querySelector<HTMLElement>('#site-search-announcement')!;
  const browse = dialog.querySelector<HTMLButtonElement>('#site-search-all')!;
  const normalize = (value: string) => value.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase().replace(/[’‘'`ʼ]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const entries = links.map(link => ({ link, name: normalize(link.dataset.searchName!), terms: normalize(link.dataset.searchTerms!) }));
  let visible = links.filter(link => !link.hidden);
  let active = -1;
  let showAll = false;
  let opener: HTMLElement | null = null;
  let previousOverflow = '';
  let animation: Animation | null = null;
  let resultsAnimation: Animation | null = null;
  let previousQuery = '';
  let closeRequest = 0;
  let outsidePress = false;

  const activate = (index: number, focus = false) => {
    active = Math.max(-1, Math.min(index, visible.length - 1));
    links.forEach(link => { link.dataset.active = String(link === visible[active]); });
    if (focus && visible[active]) { visible[active].focus({ preventScroll: true }); visible[active].scrollIntoView({ block: 'nearest', behavior: 'instant' }); }
  };
  const render = () => {
    const previousResults = visible.map(link => link.dataset.searchProject).join('|');
    const query = normalize(input.value), words = query.split(' ').filter(Boolean);
    const queryChanged = query !== previousQuery;
    previousQuery = query;
    let matches = entries.filter(entry => words.length ? words.every(word => entry.terms.includes(word)) : showAll || entry.link.dataset.suggested === 'true');
    if (query) {
      const rank = (name: string) => name === query ? 0 : name.startsWith(query) ? 1 : name.includes(query) ? 2 : 3;
      matches = matches.sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name));
    }
    visible = matches.map(entry => entry.link);
    links.forEach(link => { link.hidden = !visible.includes(link); });
    visible.forEach(link => { list.append(link); link.querySelector('img')!.loading = 'eager'; });
    list.scrollTop = 0;
    clear.hidden = !input.value;
    empty.hidden = visible.length !== 0;
    list.hidden = visible.length === 0;
    title.textContent = query ? 'Matching Projects' : showAll ? 'All Projects' : 'A Few Places to Start';
    count.textContent = `${visible.length} ${visible.length === 1 ? 'Project' : 'Projects'}`;
    announcement.textContent = query ? `${visible.length} ${visible.length === 1 ? 'project' : 'projects'} found for ${input.value}.` : showAll ? `${links.length} projects available.` : 'Three suggested projects. Search by name, type or location.';
    activate(-1);
    const resultsChanged = previousResults !== visible.map(link => link.dataset.searchProject).join('|');
    if (resultsChanged || queryChanged) {
      const target = visible.length ? list : empty;
      const movingTarget = (resultsAnimation?.effect as KeyframeEffect | null)?.target;
      const currentOpacity = resultsAnimation?.playState === 'running' && movingTarget === target ? getComputedStyle(target).opacity : '.08';
      resultsAnimation?.cancel();
      // Keep filtering immediate. A longer, even fade makes the change visible;
      // continued typing retargets the current opacity instead of flashing back.
      resultsAnimation = dialog.open && mode() !== 'off' ? target.animate([{ opacity: currentOpacity }, { opacity: 1 }], {
        duration: mode() === 'reduced' ? 100 : 460,
        easing: 'cubic-bezier(.25,.46,.45,.94)',
      }) : null;
      void resultsAnimation?.finished.catch(() => {});
    }
  };
  const reset = (all = false) => { input.value = ''; showAll = all; render(); input.focus({ preventScroll: true }); };
  const restoreFocus = () => {
    const returnTo = opener?.isConnected && opener.getClientRects().length ? opener : document.querySelector<HTMLElement>('.mobile-menu-button');
    returnTo?.focus({ preventScroll: true });
  };
  const close = (immediate = false, returnFocus = true) => {
    if (!dialog.open) return;
    const request = ++closeRequest;
    animation?.cancel();
    resultsAnimation?.cancel();
    const finish = () => {
      if (request !== closeRequest) return;
      dialog.close(); dialog.removeAttribute('data-closing');
      document.documentElement.style.overflow = previousOverflow;
      if (returnFocus) restoreFocus();
    };
    if (immediate || mode() === 'off') { finish(); return; }
    dialog.dataset.closing = 'true';
    animation = animate(dialog, [{ opacity: 1 }, { opacity: 0 }], 160);
    if (animation) void animation.finished.then(finish).catch(() => {}); else finish();
  };
  const open = (source: HTMLElement | null) => {
    if (document.querySelector('dialog[open]:not(#site-search-dialog):not(#mobile-navigation)')) return false;
    ++closeRequest;
    animation?.cancel(); dialog.removeAttribute('data-closing');
    if (dialog.open) { input.focus({ preventScroll: true }); return true; }
    opener = source;
    // Header dismisses its own surfaces synchronously before this modal takes over scrolling and focus.
    document.dispatchEvent(new CustomEvent('pi:search-open'));
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    showAll = false; input.value = ''; render();
    dialog.showModal(); input.focus({ preventScroll: true });
    animation = animate(dialog, [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], 280);
    return true;
  };
  document.querySelectorAll<HTMLAnchorElement>('[data-project-search]').forEach(link => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.setAttribute('aria-controls', dialog.id);
    link.addEventListener('click', event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (open(link)) event.preventDefault();
    });
  });
  input.addEventListener('input', () => { showAll = false; render(); });
  form.addEventListener('submit', event => { event.preventDefault(); (visible[active] || visible[0])?.click(); });
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' && visible.length) { event.preventDefault(); activate(0, true); }
    if (event.key === 'ArrowUp' && visible.length) { event.preventDefault(); activate(visible.length - 1, true); }
  });
  clear.addEventListener('click', () => reset());
  list.addEventListener('focusin', () => resultsAnimation?.cancel());
  list.addEventListener('pointerdown', () => resultsAnimation?.cancel());
  browse.addEventListener('click', () => reset(true));
  dialog.querySelector('#site-search-reset')!.addEventListener('click', () => reset(true));
  dialog.querySelector('#site-search-close')!.addEventListener('click', () => close());
  links.forEach(link => {
    link.addEventListener('focus', () => activate(visible.indexOf(link)));
    link.addEventListener('pointermove', event => { if (event.pointerType === 'mouse') activate(visible.indexOf(link)); });
    link.addEventListener('keydown', event => {
      const index = visible.indexOf(link);
      if (event.key === 'ArrowDown') { event.preventDefault(); activate((index + 1) % visible.length, true); }
      else if (event.key === 'ArrowUp') { event.preventDefault(); if (index === 0) { activate(-1); input.focus(); } else activate(index - 1, true); }
      else if (event.key === 'Home') { event.preventDefault(); activate(0, true); }
      else if (event.key === 'End') { event.preventDefault(); activate(visible.length - 1, true); }
    });
    const image = link.querySelector<HTMLImageElement>('img')!;
    const failed = () => { image.style.opacity = '0'; link.querySelector<HTMLElement>('.site-search-photo-error')!.hidden = false; };
    image.addEventListener('error', failed);
    if (image.complete && !image.naturalWidth) failed();
  });
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.addEventListener('pointerdown', event => {
    const rect = dialog.getBoundingClientRect(); outsidePress = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  });
  dialog.addEventListener('click', event => { if (event.target === dialog && outsidePress) close(); outsidePress = false; });
  dialog.addEventListener('keydown', event => {
    // A native search input otherwise consumes the first Escape to clear its value.
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key !== 'Tab') return;
    const controls = Array.from(dialog.querySelectorAll<HTMLElement>('button,a,input')).filter(element => element.getClientRects().length && !element.closest('[hidden]'));
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !event.altKey && !event.shiftKey) {
      if (open(document.activeElement as HTMLElement)) event.preventDefault();
    }
  });
  document.addEventListener('pi:motion', () => {
    if (mode() === 'full') return;
    resultsAnimation?.cancel();
    if (dialog.hasAttribute('data-closing')) close(true); else animation?.cancel();
  });
  window.addEventListener('pageshow', event => { if (event.persisted && dialog.open) close(true, false); });
  dialog.dataset.ready = 'true';
}
