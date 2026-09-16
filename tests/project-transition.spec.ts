import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

async function observeArrival(page: Page) {
  await page.addInitScript(() => {
    const save = (entry: object) => {
      const entries = JSON.parse(sessionStorage.getItem('arrival-review') || '[]');
      sessionStorage.setItem('arrival-review', JSON.stringify([...entries, { path:location.pathname, ...entry }]));
    };
    document.addEventListener('pi:project-arrival', event => {
      const phase = (event as CustomEvent).detail.phase;
      const title = document.querySelector<HTMLElement>('.project-title-row')!;
      const photo = document.querySelector<HTMLElement>('.project-hero-gallery')!;
      save({ phase, titleName:title.style.viewTransitionName, photoName:photo.querySelector<HTMLImageElement>('img')?.style.viewTransitionName });
      if (phase === 'fallback') {
        save({ phase:'frames', animations:[title,photo].map(element => element.getAnimations().map(animation => ({ duration:animation.effect?.getTiming().duration, frames:(animation.effect as KeyframeEffect)?.getKeyframes().map(frame=>({ opacity:frame.opacity, transform:frame.transform })) }))) });
        const titleAnimation=title.getAnimations()[0];
        const photoAnimation=photo.getAnimations()[0];
        if(!titleAnimation || !photoAnimation)return;
        const sampleMovingFrame=()=>{
          const titleProgress=titleAnimation.effect?.getComputedTiming().progress;
          const photoProgress=photoAnimation.effect?.getComputedTiming().progress;
          if(typeof titleProgress==='number' && titleProgress>0 && titleProgress<1 && typeof photoProgress==='number' && photoProgress>0 && photoProgress<1){
            save({phase:'sample',titleProgress,photoProgress,opacity:getComputedStyle(title).opacity,transform:getComputedStyle(photo).transform});
            return;
          }
          if([titleAnimation,photoAnimation].some(animation=>animation.playState==='finished'||animation.playState==='idle')){
            save({phase:'sample-missed',titleProgress,photoProgress});
            return;
          }
          requestAnimationFrame(sampleMovingFrame);
        };
        // The compositor can still have both animations pending after two
        // animation frames. Sample their actual progress, without changing
        // their speed, pausing them or accepting a stationary initial frame.
        void Promise.all([titleAnimation.ready,photoAnimation.ready]).then(()=>requestAnimationFrame(sampleMovingFrame)).catch(()=>{});
      }
    });
  });
}

async function arrivalEntries(page:Page) {
  return page.evaluate(() => JSON.parse(sessionStorage.getItem('arrival-review') || '[]'));
}

async function settledOpening(page:Page) {
  await expect(page.locator('html')).toHaveAttribute('data-project-arrival', /^(done|skipped)$/);
  await expect(page.locator('.project-title-row')).toHaveCSS('opacity','1');
  await expect(page.locator('.project-hero-gallery')).toHaveCSS('opacity','1');
  await expect.poll(()=>page.locator('[data-pi-transition]').count()).toBe(0);
}

async function openHeaderDarcy(page:Page) {
  await page.locator('[data-menu-trigger="projects"]').hover();
  const link = page.locator('.project-menu-preview[data-project-card="darcy"]');
  await expect(link).toBeVisible();
  await expect.poll(()=>link.locator('img').evaluate((image:HTMLImageElement)=>image.complete && image.naturalWidth>0)).toBe(true);
  await link.click();
  await expect(page).toHaveURL(/\/darcy\/?$/);
}

test('a project card arrives at its opening photograph with native motion or the browser fallback', async ({ page }) => {
  await page.addInitScript(() => {
    window.addEventListener('pagereveal', event => {
      const transition = (event as Event & { viewTransition?: { ready: Promise<void> } }).viewTransition;
      const report = (outcome: string) => sessionStorage.setItem('transition-review', JSON.stringify({
        path: location.pathname,
        outcome,
        name: document.querySelector<HTMLImageElement>('[data-primary-project]')?.style.viewTransitionName || '',
      }));
      if (!transition) { report('fallback'); return; }
      report('pending');
      // Chrome can omit or skip a native transition when a document is not
      // visible. Its ready promise distinguishes that from an animated frame.
      void transition.ready.then(() => report('animated'), () => report('fallback'));
    });
  });
  await page.goto('/');
  await page.locator('[data-project="crestmont-west"] a').click();
  await expect(page).toHaveURL(/\/crestmontwest\/?$/);
  await expect(page.locator('.primary-figure .gallery-link')).toHaveAttribute('data-gallery-index', '0');
  await expect(page.locator('[data-primary-project]')).toHaveAttribute('src', '/media/gallery/crestmont-west/1.webp');
  await expect.poll(() => page.evaluate(() => {
    const review = JSON.parse(sessionStorage.getItem('transition-review') || 'null');
    return review?.path === '/crestmontwest' ? review.outcome : 'pending';
  })).toMatch(/^(animated|fallback)$/);
  const review = await page.evaluate(() => ({
    ...JSON.parse(sessionStorage.getItem('transition-review') || 'null'),
    token: sessionStorage.getItem('pi-photo-transition'),
  }));
  expect(review.token).toBeNull();
  if (review.outcome === 'animated') expect(review.name).toBe('project-photo');
});

test('a matching opening image receives its transition identity and consumes the record', async ({ page }) => {
  await page.goto('/crestmontwest');
  await settledOpening(page);
  const result = await page.evaluate(() => {
    sessionStorage.setItem('pi-photo-transition', JSON.stringify({ path: location.pathname, id: 'crestmont-west', source:'/media/projects/crestmont-west.webp', at:Date.now() }));
    const event = new Event('pagereveal');
    Object.defineProperty(event, 'viewTransition', { value: { finished: new Promise(() => {}), skipTransition() {} } });
    window.dispatchEvent(event);
    const image = document.querySelector<HTMLImageElement>('[data-primary-project]')!;
    return { source: image.getAttribute('src'), name: image.style.viewTransitionName, token: sessionStorage.getItem('pi-photo-transition') };
  });
  expect(result).toEqual({ source: '/media/gallery/crestmont-west/1.webp', name: 'project-photo', token: null });
});

test('the arrival waits for opening image markup when document parsing is delayed', async ({ page }) => {
  await page.route('**/transition-parser-pause.js', async route => {
    await new Promise(resolve => setTimeout(resolve, 180));
    await route.fulfill({ contentType: 'application/javascript', body: '' });
  });
  await page.route(/\/crestmontwest\/?$/, async route => {
    const response = await route.fetch();
    const html = await response.text();
    // A parser pause before the photograph reproduces incremental arrival of
    // the page. It must not let the native transition capture an empty target.
    const body = html.replace(/(<img\b[^>]*\bdata-primary-project="crestmont-west"[^>]*>)/, '<script src="/transition-parser-pause.js"></script>$1');
    expect(body).not.toBe(html);
    await route.fulfill({ response, body });
  });
  await page.addInitScript(() => {
    window.addEventListener('pagereveal', () => {
      sessionStorage.setItem('opening-present-at-reveal', String(!!document.querySelector('[data-primary-project]')));
    });
  });
  await page.goto('/');
  await page.locator('[data-project="crestmont-west"] a').click();
  await expect(page).toHaveURL(/\/crestmontwest\/?$/);
  await expect(page.locator('#project-opening-image')).toHaveAttribute('data-primary-project', 'crestmont-west');
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('opening-present-at-reveal'))).toBe('true');
});

test('a restored carousel image does not inherit the opening photograph identity', async ({ page }) => {
  await page.goto('/crestmontwest');
  await settledOpening(page);
  await page.getByRole('button', { name: 'Next opening image', exact: true }).click();
  await expect(page.locator('.primary-figure .gallery-link')).toHaveAttribute('data-gallery-index', '1');
  // Reproduce the arrival state of a cached page without depending on whether
  // this browser run enables its back/forward cache.
  const result = await page.evaluate(() => {
    sessionStorage.setItem('pi-photo-transition', JSON.stringify({ path: location.pathname, id: 'crestmont-west', source:'/media/projects/crestmont-west.webp', at:Date.now() }));
    const event = new Event('pagereveal');
    Object.defineProperty(event, 'viewTransition', { value: { finished: new Promise(() => {}), skipTransition() {} } });
    window.dispatchEvent(event);
    const image = document.querySelector<HTMLImageElement>('[data-primary-project]')!;
    return { source: image.getAttribute('src'), name: image.style.viewTransitionName, token: sessionStorage.getItem('pi-photo-transition') };
  });
  expect(result).toEqual({ source: '/media/gallery/crestmont-west/2.webp', name: '', token: null });
});

test('header D’Arcy opens with one native photo transition or a real animated entrance', async ({page})=>{
  await observeArrival(page);
  await page.goto('/');
  await openHeaderDarcy(page);
  await expect(page.locator('#project-title')).toHaveText('D’Arcy');
  await expect(page.locator('#project-opening-image')).toHaveAttribute('src','/media/gallery/darcy/1.webp');
  await settledOpening(page);
  const entries = (await arrivalEntries(page)).filter((entry:{path:string})=>entry.path==='/darcy');
  const phase = entries.filter((entry:{phase:string})=>['native','fallback'].includes(entry.phase));
  expect(phase).toHaveLength(1);
  if(phase[0].phase==='native') {
    expect(phase[0].photoName).toBe('project-photo');
    expect(phase[0].titleName).toBe('project-intro');
  } else expect(entries.find((entry:{phase:string})=>entry.phase==='frames').animations.flat()).toHaveLength(2);
  expect(await page.evaluate(()=>sessionStorage.getItem('pi-photo-transition'))).toBeNull();
});

test('a direct project visit visibly fades and lifts the title and photograph over half a second', async ({page})=>{
  await observeArrival(page);
  await page.goto('/darcy');
  await settledOpening(page);
  const entries = await arrivalEntries(page);
  expect(entries.filter((entry:{phase:string})=>entry.phase==='fallback')).toHaveLength(1);
  const frames = entries.find((entry:{phase:string})=>entry.phase==='frames').animations.flat();
  expect(frames.map((animation:{duration:number})=>animation.duration)).toEqual([1120,1240]);
  for(const animation of frames) expect(animation.frames).toEqual([{opacity:'0',transform:'translateY(16px)'},{opacity:'1',transform:'translateY(0px)'}]);
  const sample = entries.find((entry:{phase:string})=>entry.phase==='sample');
  expect(sample).toBeDefined();
  expect(sample.titleProgress).toBeGreaterThan(0);
  expect(sample.titleProgress).toBeLessThan(1);
  expect(sample.photoProgress).toBeGreaterThan(0);
  expect(sample.photoProgress).toBeLessThan(1);
  expect(Number(sample.opacity)).toBeGreaterThan(0);
  expect(Number(sample.opacity)).toBeLessThan(1);
  expect(sample.transform).not.toBe('none');
});

test('a skipped native transition falls back once and never leaves the page hidden', async ({page})=>{
  await observeArrival(page);
  await page.addInitScript(()=>window.addEventListener('pagereveal',event=>{
    if(location.pathname==='/darcy') (event as Event & {viewTransition?:{skipTransition:()=>void}}).viewTransition?.skipTransition();
  }));
  await page.goto('/');
  await openHeaderDarcy(page);
  await settledOpening(page);
  const phases = (await arrivalEntries(page)).filter((entry:{path:string;phase:string})=>entry.path==='/darcy' && ['native','fallback'].includes(entry.phase));
  expect(phases.map((entry:{phase:string})=>entry.phase)).toEqual(['fallback']);
});

for(const preference of ['reduced','off'] as const) test(`${preference} motion presents projects immediately without an entrance`,async({page})=>{
  await observeArrival(page);
  await page.addInitScript(preference=>localStorage.setItem('pi-motion',preference),preference);
  await page.goto('/');
  await openHeaderDarcy(page);
  await settledOpening(page);
  await expect(page.locator('html')).toHaveAttribute('data-project-arrival','skipped');
  expect(await arrivalEntries(page)).toHaveLength(0);
});

test('returning to a project with Back does not replay its entrance',async({page})=>{
  await observeArrival(page);
  await page.goto('/darcy');
  await settledOpening(page);
  const before = (await arrivalEntries(page)).length;
  await page.goto('/');
  await page.goBack();
  await expect(page).toHaveURL(/\/darcy\/?$/);
  await settledOpening(page);
  expect((await arrivalEntries(page)).length).toBe(before);
});

test('rapid project changes settle the final page with no stale photograph identity',async({page})=>{
  await observeArrival(page);
  await page.goto('/darcy',{waitUntil:'domcontentloaded'});
  await page.goto('/crestmontwest',{waitUntil:'domcontentloaded'});
  await settledOpening(page);
  await expect(page.locator('#project-title')).toHaveText('Crestmont West');
  await expect(page.locator('#project-opening-image')).toHaveAttribute('src','/media/gallery/crestmont-west/1.webp');
  expect(await page.evaluate(()=>sessionStorage.getItem('pi-photo-transition'))).toBeNull();
});

test('an unrelated or expired source never inherits the opening photo identity',async({page})=>{
  await page.goto('/darcy');
  await settledOpening(page);
  const rejected = await page.evaluate(()=>[
    {path:'/darcy',id:'darcy',source:'/media/projects/crestmont-west.webp',at:Date.now()},
    {path:'/darcy',id:'darcy',source:'/media/projects/darcy.webp',at:Date.now()-16000},
  ].map(entry=>{
    sessionStorage.setItem('pi-photo-transition',JSON.stringify(entry));
    let skipped=false;
    const event=new Event('pagereveal');
    Object.defineProperty(event,'viewTransition',{value:{finished:Promise.resolve(),skipTransition(){skipped=true;}}});
    window.dispatchEvent(event);
    return {skipped,name:document.querySelector<HTMLImageElement>('[data-primary-project]')!.style.viewTransitionName,token:sessionStorage.getItem('pi-photo-transition')};
  }));
  expect(rejected).toEqual([{skipped:true,name:'',token:null},{skipped:true,name:'',token:null}]);
});

test('the complete opening remains visible when JavaScript is disabled',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:4321/darcy');
  await expect(page.locator('#project-title')).toHaveText('D’Arcy');
  await expect(page.locator('.project-title-row')).toHaveCSS('opacity','1');
  await expect(page.locator('.project-hero-gallery')).toHaveCSS('opacity','1');
  await context.close();
});

