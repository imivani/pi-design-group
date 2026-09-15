type MenuName = 'projects' | 'services';

const header = document.querySelector<HTMLElement>('#site-header');
const surface = document.querySelector<HTMLElement>('#desktop-navigation');
const mobile = document.querySelector<HTMLDialogElement>('#mobile-navigation');

if (header && surface && mobile) {
  const triggers = Array.from(header.querySelectorAll<HTMLButtonElement>('[data-menu-trigger]'));
  const panes = Array.from(surface.querySelectorAll<HTMLElement>('[data-menu-pane]'));
  const mobileButton = header.querySelector<HTMLButtonElement>('.mobile-menu-button')!;
  const desktop = matchMedia('(min-width: 1100px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let openMenu: MenuName | null = null;
  let desktopOwnsFocus = false;
  let openingTimer: ReturnType<typeof setTimeout> | undefined;
  let closingTimer: ReturnType<typeof setTimeout> | undefined;
  let incomingPane: Animation | undefined;
  let serviceRequest = 0;
  let catalogueTimer: ReturnType<typeof setTimeout> | undefined;
  let catalogueAnimation: Animation | undefined;
  let previewAnimation: Animation | undefined;
  let previewRequest = 0;
  let previewTarget: string | undefined;
  let mobileAnimation: Animation | undefined;
  const disclosureAnimations = new Map<HTMLElement, Animation>();
  const projectsPane = surface.querySelector<HTMLElement>('#projects-navigation')!;
  const overview = surface.querySelector<HTMLElement>('#project-menu-overview')!;
  const catalogue = surface.querySelector<HTMLElement>('#project-menu-catalogue')!;
  const catalogueButton = surface.querySelector<HTMLButtonElement>('button[data-catalogue-open]')!;
  const catalogueBack = surface.querySelector<HTMLButtonElement>('[data-catalogue-back]')!;

  const motionMode = () => {
    const mode = document.documentElement.dataset.motion;
    return mode === 'off' ? 'off' : mode === 'reduced' || reduced.matches ? 'reduced' : 'full';
  };
  const clearTimers = () => { clearTimeout(openingTimer); clearTimeout(closingTimer); clearTimeout(catalogueTimer); };
  const activePane = () => panes.find((pane) => pane.dataset.menuPane === openMenu);
  const paneControls = () => Array.from(activePane()?.querySelectorAll<HTMLAnchorElement | HTMLButtonElement>('a,button') || []).filter((element) => !element.closest('[inert]') && element.getClientRects().length > 0);
  const setMenu = (menu: MenuName | null, returnFocus = false) => {
    clearTimers();
    if (!desktop.matches) menu = null;
    const previous = openMenu;
    const changing = previous !== null && menu !== null && previous !== menu;
    openMenu = menu;
    incomingPane?.cancel();
    for (const trigger of triggers) trigger.setAttribute('aria-expanded', String(trigger.dataset.menuTrigger === menu));
    surface.dataset.open = String(menu !== null);
    surface.setAttribute('aria-hidden', String(menu === null));
    surface.inert = menu === null;
    // Keep the departing pane painted until the surface fades; inert takes effect immediately.
    if (menu) {
      if (menu === 'projects' && previous !== 'projects') setCatalogue(false);
      surface.dataset.menu = menu;
      for (const pane of panes) {
        const selected = pane.dataset.menuPane === menu;
        pane.setAttribute('aria-hidden', String(!selected));
        pane.inert = !selected;
      }
      if (changing && motionMode() !== 'off') incomingPane = activePane()?.animate([{ opacity: .35 }, { opacity: 1 }], { duration: motionMode() === 'reduced' ? 100 : 180, easing: 'ease-out' });
    } else {
      for (const pane of panes) pane.inert = true;
    }
    if (returnFocus && previous) triggers.find((trigger) => trigger.dataset.menuTrigger === previous)?.focus({ preventScroll: true });
  };
  const setCatalogue = (opening: boolean, moveFocus = false) => {
    clearTimeout(catalogueTimer);
    const changed = projectsPane.dataset.catalogueOpen !== String(opening);
    catalogueAnimation?.cancel();
    projectsPane.dataset.catalogueOpen = String(opening);
    surface.dataset.catalogueOpen = String(opening);
    catalogueButton.setAttribute('aria-expanded', String(opening));
    overview.inert = opening;
    overview.setAttribute('aria-hidden', String(opening));
    catalogue.inert = !opening;
    catalogue.setAttribute('aria-hidden', String(!opening));
    if (moveFocus) (opening ? catalogueBack : catalogueButton).focus({ preventScroll: true });
    if (changed && motionMode() !== 'off') catalogueAnimation = (opening ? catalogue : overview).animate(
      [{ opacity: .2 }, { opacity: 1 }], { duration: motionMode() === 'full' ? 200 : 100, easing: 'ease-out' },
    );
  };
  catalogueButton.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'mouse') return;
    clearTimeout(catalogueTimer);
    catalogueTimer = setTimeout(() => setCatalogue(true, overview.contains(document.activeElement)), 140);
  });
  catalogueButton.addEventListener('pointerleave', () => clearTimeout(catalogueTimer));
  catalogueButton.addEventListener('click', () => setCatalogue(true, true));
  catalogueBack.addEventListener('click', () => setCatalogue(false, true));
  const scheduleClose = () => {
    clearTimeout(openingTimer);
    clearTimeout(closingTimer);
    closingTimer = setTimeout(() => {
      // Mouse movement never dismisses navigation that a keyboard user is browsing.
      if (surface.contains(document.activeElement) || triggers.some((trigger) => trigger.dataset.menuTrigger === openMenu && trigger === document.activeElement)) return;
      setMenu(null);
    }, 180);
  };
  for (const trigger of triggers) {
    const menu = trigger.dataset.menuTrigger as MenuName;
    trigger.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'mouse') return;
      clearTimers();
      openingTimer = setTimeout(() => setMenu(menu), 120);
    });
    trigger.addEventListener('pointerleave', (event) => { if (event.pointerType === 'mouse') scheduleClose(); });
    trigger.addEventListener('click', () => { clearTimers(); setMenu(openMenu === menu ? null : menu); });
    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setMenu(menu);
        paneControls()[0]?.focus();
      }
    });
  }
  surface.addEventListener('pointerenter', clearTimers);
  surface.addEventListener('pointerleave', (event) => { if (event.pointerType === 'mouse') scheduleClose(); });
  document.addEventListener('pointerdown', (event) => {
    if (!surface.contains(event.target as Node) && !triggers.some((trigger) => trigger.contains(event.target as Node))) {
      desktopOwnsFocus = false;
      setMenu(null);
    }
  });
  document.addEventListener('focusin', (event) => {
    const target = event.target as Node;
    desktopOwnsFocus = surface.contains(target) || triggers.some((trigger) => trigger.contains(target));
    if (!desktopOwnsFocus) setMenu(null);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && openMenu) {
      event.preventDefault();
      if (openMenu === 'projects' && projectsPane.dataset.catalogueOpen === 'true') setCatalogue(false, true);
      else setMenu(null, true);
    }
    if (event.key === 'Tab' && openMenu) {
      const trigger = triggers.find((item) => item.dataset.menuTrigger === openMenu);
      const links = paneControls();
      // The overlay is a DOM sibling for unclipped positioning; bridge its natural reading order.
      if (!event.shiftKey && document.activeElement === trigger && links?.length) {
        event.preventDefault(); links[0].focus();
      } else if (event.shiftKey && links?.length && document.activeElement === links[0]) {
        event.preventDefault(); trigger?.focus();
      } else if (!event.shiftKey && links?.length && document.activeElement === links[links.length - 1]) {
        event.preventDefault();
        const next = openMenu === 'projects' ? triggers.find((item) => item.dataset.menuTrigger === 'services') : header.querySelector<HTMLAnchorElement>('.desktop-nav [data-contact-link]');
        setMenu(null); next?.focus();
      }
    }
  });

  const selectServicePreview = async (id: string) => {
    const request = ++serviceRequest;
    const target = surface.querySelector<HTMLImageElement>(`[data-service-image="${id}"]`);
    if (!target) return;
    // Decode before switching, and discard a stale decode when the pointer has moved on.
    try { target.loading = 'eager'; await target.decode(); } catch { return; }
    if (request !== serviceRequest) return;
    for (const image of surface.querySelectorAll<HTMLImageElement>('[data-service-image]')) image.dataset.active = String(image === target);
    for (const link of surface.querySelectorAll<HTMLElement>('[data-service-link]')) link.dataset.active = String(link.dataset.serviceLink === id);
  };
  surface.querySelectorAll<HTMLElement>('[data-service-link]').forEach((link) => {
    link.addEventListener('pointerenter', (event) => { if (event.pointerType === 'mouse') void selectServicePreview(link.dataset.serviceLink!); });
    link.addEventListener('focus', () => void selectServicePreview(link.dataset.serviceLink!));
  });

  const selectProjectPreview = async (link: HTMLAnchorElement) => {
    if (previewTarget === link.dataset.catalogueProject) return;
    previewTarget = link.dataset.catalogueProject;
    const request = ++previewRequest;
    const image = new Image();
    image.src = link.dataset.previewSrc!;
    try { await image.decode(); } catch { if (request === previewRequest) previewTarget = undefined; return; }
    if (request !== previewRequest) return;
    const current = surface.querySelector<HTMLImageElement>('[data-catalogue-preview-image]')!;
    const destination = surface.querySelector<HTMLAnchorElement>('[data-catalogue-preview-link]')!;
    const kind = surface.querySelector<HTMLElement>('[data-catalogue-preview-kind]')!;
    const name = link.querySelector('span')!.textContent!;
    previewAnimation?.cancel();
    current.parentElement!.querySelectorAll('[data-preview-outgoing]').forEach((element) => element.remove());
    // Keep the last decoded photo beneath the next one; the reserved frame never flashes blank.
    const outgoing = current.cloneNode() as HTMLImageElement;
    outgoing.removeAttribute('data-catalogue-preview-image');
    outgoing.dataset.previewOutgoing = '';
    outgoing.alt = '';
    outgoing.setAttribute('aria-hidden', 'true');
    outgoing.style.cssText = 'position:absolute;inset:0;pointer-events:none';
    if (motionMode() !== 'off') current.before(outgoing);
    current.src = image.src;
    current.alt = link.dataset.previewAlt!;
    current.dataset.kind = link.dataset.previewKind!;
    current.style.position = 'relative';
    destination.href = link.href;
    destination.dataset.projectCard = link.dataset.catalogueProject!;
    surface.querySelector('[data-catalogue-preview-name]')!.textContent = name;
    surface.querySelector('[data-catalogue-preview-place]')!.textContent = link.dataset.previewPlace!;
    kind.hidden = link.dataset.previewKind === 'photograph';
    kind.textContent = link.dataset.previewKind === 'drawing' ? 'Drawing' : link.dataset.previewCredit || 'Rendering by project architect';
    catalogue.querySelectorAll<HTMLElement>('[data-catalogue-project]').forEach((item) => { item.dataset.active = String(item === link); });
    if (motionMode() !== 'off') {
      previewAnimation = current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: motionMode() === 'full' ? 240 : 100, easing: 'ease-out' });
      previewAnimation.finished.then(() => outgoing.remove()).catch(() => outgoing.remove());
    }
  };
  catalogue.querySelectorAll<HTMLAnchorElement>('[data-catalogue-project]').forEach((link) => {
    // A layout change can move a link under a stationary pointer. Only real pointer
    // movement may replace a preview that the keyboard has deliberately selected.
    link.addEventListener('pointermove', (event) => { if (event.pointerType === 'mouse') void selectProjectPreview(link); });
    link.addEventListener('focus', () => void selectProjectPreview(link));
  });

  let mobileClosing = false;
  const finishMobileClose = (returnFocus: boolean) => {
    mobileClosing = false;
    mobile.close();
    mobileButton.setAttribute('aria-expanded', 'false');
    document.documentElement.style.removeProperty('overflow');
    if (returnFocus) mobileButton.focus({ preventScroll: true });
  };
  const closeMobile = (returnFocus = true) => {
    if (mobileClosing && returnFocus) return;
    const opacity = getComputedStyle(mobile).opacity;
    const transform = getComputedStyle(mobile).transform;
    mobileAnimation?.cancel();
    if (!returnFocus || motionMode() === 'off') { finishMobileClose(returnFocus); return; }
    mobileClosing = true;
    const closing = mobile.animate(motionMode() === 'full' ? [{ opacity, transform }, { opacity: 0, transform: 'translateY(-16px)' }] : [{ opacity }, { opacity: 0 }], {duration: motionMode() === 'full' ? 220 : 100, easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'});
    mobileAnimation = closing;
    void closing.finished.then(() => { if (mobileAnimation === closing) { finishMobileClose(returnFocus); closing.cancel(); } }).catch(() => {});
  };
  mobileButton.addEventListener('click', () => {
    setMenu(null);
    if (mobile.open) { closeMobile(); return; }
    mobile.showModal();
    mobileButton.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
    mobile.querySelector<HTMLButtonElement>('[data-mobile-close]')?.focus({ preventScroll: true });
    if (motionMode() !== 'off') mobileAnimation = mobile.animate(
      motionMode() === 'full' ? [{ opacity: 0, transform: 'translateY(-24px)' }, { opacity: 1, transform: 'translateY(0)' }] : [{ opacity: 0 }, { opacity: 1 }],
      { duration: motionMode() === 'full' ? 420 : 100, easing: 'cubic-bezier(.22,1,.36,1)' },
    );
  });
  mobile.querySelector('[data-mobile-close]')?.addEventListener('click', () => closeMobile());
  mobile.addEventListener('cancel', (event) => { event.preventDefault(); closeMobile(); });
  mobile.addEventListener('click', (event) => {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a');
    if (link && !link.matches('[data-project-search]')) closeMobile(false);
  });

  mobile.querySelectorAll<HTMLButtonElement>('[data-mobile-disclosure]').forEach((button) => {
    const body = document.getElementById(button.dataset.mobileDisclosure!)!;
    button.addEventListener('click', () => {
      const opening = button.getAttribute('aria-expanded') !== 'true';
      const start = body.getBoundingClientRect().height;
      disclosureAnimations.get(body)?.cancel();
      button.setAttribute('aria-expanded', String(opening));
      body.setAttribute('aria-hidden', String(!opening));
      body.inert = !opening;
      const end = opening ? body.firstElementChild!.getBoundingClientRect().height : 0;
      body.style.height = opening ? 'auto' : '0px';
      if (motionMode() !== 'full') return;
      const animation = body.animate([{ height: `${start}px`, opacity: opening ? .45 : 1 }, { height: `${end}px`, opacity: opening ? 1 : .45 }], { duration: 340, easing: 'cubic-bezier(.22,1,.36,1)' });
      disclosureAnimations.set(body, animation);
      animation.finished.then(() => { if (disclosureAnimations.get(body) === animation) disclosureAnimations.delete(body); }).catch(() => {});
    });
  });

  document.querySelectorAll<HTMLAnchorElement>('[data-project-category]').forEach((link) => link.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('pi:filter', { detail: { category: link.dataset.projectCategory } }));
    setMenu(null);
  }));
  document.querySelectorAll<HTMLAnchorElement>('[data-service-link],[data-mobile-service]').forEach((link) => link.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('pi:service', { detail: { id: link.dataset.serviceLink || link.dataset.mobileService } }));
    setMenu(null);
  }));
  document.addEventListener('pi:search-open', () => {
    setMenu(null);
    if (mobile.open) closeMobile(false);
  });

  const hero = document.querySelector('#hero');
  const scrollSentinel = document.querySelector('.header-scroll-sentinel');
  if (scrollSentinel) new IntersectionObserver(([entry]) => {
    header.dataset.scrolled = String(!entry.isIntersecting);
  }, { threshold: 0 }).observe(scrollSentinel);
  let heroObserver: IntersectionObserver | undefined;
  const watchHero = () => {
    heroObserver?.disconnect();
    if (!hero) { header.dataset.theme = 'light'; return; }
    heroObserver = new IntersectionObserver(([entry]) => { header.dataset.theme = entry.isIntersecting ? 'dark' : 'light'; }, { rootMargin: `-${header.getBoundingClientRect().height}px 0px 0px 0px`, threshold: 0 });
    heroObserver.observe(hero);
  };
  watchHero();
  new ResizeObserver(watchHero).observe(header);
  const resize = () => {
    if (!desktop.matches) {
      // CSS can hide desktop controls and blur them to body before this media-query
      // event runs. Retain their focus ownership, but clear it on an outside click
      // or a deliberate focus change so resizing never steals focus from the page.
      const hadDesktopFocus = surface.contains(document.activeElement) || triggers.some((trigger) => trigger === document.activeElement) || (desktopOwnsFocus && document.activeElement === document.body);
      desktopOwnsFocus = false;
      setMenu(null);
      if (hadDesktopFocus) mobileButton.focus({ preventScroll: true });
    } else if (mobile.open) {
      closeMobile(false);
      header.querySelector<HTMLAnchorElement>('.site-wordmark')?.focus({ preventScroll: true });
    }
    watchHero();
  };
  desktop.addEventListener('change', resize);
  const resolveMotion = () => {
    if (motionMode() === 'full') return;
    if (mobileClosing) finishMobileClose(true);
    incomingPane?.cancel(); mobileAnimation?.cancel(); catalogueAnimation?.cancel(); previewAnimation?.cancel();
    for (const animation of disclosureAnimations.values()) animation.cancel();
    disclosureAnimations.clear();
  };
  reduced.addEventListener('change', resolveMotion);
  new MutationObserver(resolveMotion).observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { clearTimers(); incomingPane?.cancel(); catalogueAnimation?.cancel(); previewAnimation?.cancel(); } });
  header.dataset.ready = 'true';
}
