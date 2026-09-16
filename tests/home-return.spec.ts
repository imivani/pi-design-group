import { test, expect, type Page } from '@playwright/test';

async function observe(page:Page){
  await page.addInitScript(()=>{
    (window as any).__homeReview=[];
    document.addEventListener('pi:home-return',event=>{
      const phase=(event as CustomEvent).detail.phase;
      const copy=document.querySelector<HTMLElement>('.hero-copy')!;
      const media=document.querySelector<HTMLElement>('.hero-media')!;
      const frames=[media,copy].flatMap(element=>element.getAnimations().map(animation=>({
        duration:animation.effect?.getTiming().duration,
        keyframes:(animation.effect as KeyframeEffect)?.getKeyframes().map(frame=>({opacity:frame.opacity,transform:frame.transform})),
      })));
      (window as any).__homeReview.push({
        phase,name:copy.style.viewTransitionName,
        duration:getComputedStyle(document.documentElement,'::view-transition-new(root)').animationDuration,
        frames,
      });
      if(phase==='fallback')requestAnimationFrame(()=>requestAnimationFrame(()=>(window as any).__homeReview.push({phase:'sample',opacity:getComputedStyle(copy).opacity,transform:getComputedStyle(copy).transform})));
    });
  });
}
const events=(page:Page)=>page.evaluate(()=>(window as any).__homeReview as Array<any>);
async function settledHome(page:Page){
  await expect(page).toHaveURL(/\/#hero$/);
  await expect(page.locator('html')).toHaveAttribute('data-home-return',/^(done|skipped)$/);
  await expect(page.locator('.hero-copy')).toHaveCSS('opacity','1');
  await expect(page.locator('.hero-media')).toHaveCSS('opacity','1');
  await expect.poll(()=>page.locator('[data-pi-transition]').count()).toBe(0);
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
}
async function returnThroughLogo(page:Page){
  await page.goto('/darcy');
  await expect(page.locator('html')).toHaveAttribute('data-project-arrival',/^(done|skipped)$/);
  await page.locator('#site-header .site-wordmark').click();
  await settledHome(page);
}

test('the project logo returns to the video hero with one smooth visible entrance',async({page})=>{
  await observe(page);
  await returnThroughLogo(page);
  const entrances=(await events(page)).filter(entry=>['native','fallback'].includes(entry.phase));
  expect(entrances).toHaveLength(1);
  if(entrances[0].phase==='native'){
    expect(entrances[0].duration).toBe('0.48s');
    expect(entrances[0].name).toBe('home-intro');
  }else expect(entrances[0].frames.map((frame:any)=>frame.duration)).toEqual([480,480]);
  await expect.poll(()=>page.locator('#hero-video').evaluate((video:HTMLVideoElement)=>video.readyState>=2&&!video.paused)).toBe(true);
  expect(await page.evaluate(()=>sessionStorage.getItem('pi-home-return'))).toBeNull();
});

test('an early logo click stays visible and produces no browser errors',async({page})=>{
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  await observe(page);
  // Click as soon as the document is usable, while its own entrance can still
  // be running. The production verifier repeats this with cold CSS files.
  await page.goto('/darcy',{waitUntil:'domcontentloaded'});
  await page.locator('#site-header .site-wordmark').click();
  await settledHome(page);
  expect((await events(page)).filter(entry=>['native','fallback'].includes(entry.phase))).toHaveLength(1);
  expect(errors).toEqual([]);
});

test('aborted native readiness is handled before optional motion modules need it',async({page})=>{
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  await page.evaluate(async()=>{
    for(const type of ['pageswap','pagereveal']){
      const event=new Event(type);
      Object.defineProperty(event,'viewTransition',{value:{
        ready:Promise.reject(new DOMException('Transition capture was interrupted','AbortError')),
        finished:Promise.resolve(),
        skipTransition(){},
      }});
      window.dispatchEvent(event);
    }
    // Rejection events are dispatched after the current task. Do not install
    // or suppress any error handler; the inline lifecycle must observe them.
    await new Promise(resolve=>setTimeout(resolve,50));
  });
  expect(errors).toEqual([]);
  await expect(page.locator('#hero-title')).toBeVisible();
});

test('a browser that skips the native return still fades the hero and lifts the copy',async({page})=>{
  await observe(page);
  await page.addInitScript(()=>window.addEventListener('pagereveal',event=>{
    if(location.hash==='#hero')(event as Event&{viewTransition?:{skipTransition:()=>void}}).viewTransition?.skipTransition();
  }));
  await returnThroughLogo(page);
  const review=await events(page);
  expect(review.filter(entry=>['native','fallback'].includes(entry.phase)).map(entry=>entry.phase)).toEqual(['fallback']);
  expect(review[0].frames.map((frame:any)=>frame.duration)).toEqual([480,480]);
  expect(review[0].frames[1].keyframes).toEqual([{opacity:'0',transform:'translateY(12px)'},{opacity:'1',transform:'translateY(0px)'}]);
  const sample=review.find(entry=>entry.phase==='sample');
  expect(Number(sample.opacity)).toBeGreaterThan(0);
  expect(Number(sample.opacity)).toBeLessThan(1);
  expect(sample.transform).not.toBe('none');
});

for(const choice of ['reduced','off'])test(`${choice} motion returns through the logo immediately`,async({page})=>{
  await observe(page);
  await page.addInitScript(choice=>localStorage.setItem('pi-motion',choice),choice);
  await returnThroughLogo(page);
  expect(await events(page)).toEqual([]);
  await expect(page.locator('html')).toHaveAttribute('data-home-return','skipped');
});

test('system reduced motion presents the homepage immediately',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await observe(page);
  await returnThroughLogo(page);
  expect(await events(page)).toEqual([]);
});

test('the logo keeps smooth scrolling within the homepage without replaying an entrance',async({page})=>{
  await observe(page);
  await page.goto('/');
  await page.locator('#projects').scrollIntoViewIfNeeded();
  const start=await page.evaluate(()=>scrollY);
  expect(start).toBeGreaterThan(1000);
  const timeOrigin=await page.evaluate(()=>performance.timeOrigin);
  await page.evaluate(()=>{
    (window as any).__scrollSamples=[];
    const until=performance.now()+1200;
    const sample=()=>{(window as any).__scrollSamples.push(scrollY);if(performance.now()<until)requestAnimationFrame(sample);};
    requestAnimationFrame(sample);
  });
  await page.locator('#site-header .site-wordmark').click();
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
  const samples=await page.evaluate(()=>(window as any).__scrollSamples as number[]);
  expect(samples.filter(value=>value>0&&value<start).length).toBeGreaterThan(4);
  expect(await page.evaluate(()=>performance.timeOrigin)).toBe(timeOrigin);
  expect(await events(page)).toEqual([]);
});

test('Back and reload do not replay the homepage return',async({page})=>{
  await observe(page);
  await returnThroughLogo(page);
  await page.evaluate(()=>(window as any).__homeReview=[]);
  await page.goto('/crestmontwest');
  await page.goBack();
  await settledHome(page);
  expect(await events(page)).toEqual([]);
  await page.reload();
  await settledHome(page);
  expect(await events(page)).toEqual([]);
});

test('blocked browser storage still permits a smooth logo return',async({page})=>{
  await observe(page);
  await page.addInitScript(()=>{
    for(const name of ['localStorage','sessionStorage'])Object.defineProperty(window,name,{configurable:true,get(){throw new DOMException('Storage unavailable','SecurityError');}});
  });
  await returnThroughLogo(page);
  expect((await events(page)).filter(entry=>['native','fallback'].includes(entry.phase))).toHaveLength(1);
});

test('a failed optional return module cannot leave homepage content hidden',async({page})=>{
  await page.route('**/src/scripts/home-return.ts',route=>route.abort());
  await page.goto('/darcy');
  await page.locator('#site-header .site-wordmark').click();
  await expect(page).toHaveURL(/\/#hero$/);
  await expect(page.locator('.hero-copy')).toHaveCSS('opacity','1');
  await expect(page.locator('.hero-media')).toHaveCSS('opacity','1');
  await expect(page.getByRole('heading',{level:1})).toBeVisible();
});

test('the narrow mobile logo returns to an unclipped hero',async({page})=>{
  await page.setViewportSize({width:320,height:844});
  await observe(page);
  await returnThroughLogo(page);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  expect((await events(page)).filter(entry=>['native','fallback'].includes(entry.phase))).toHaveLength(1);
});

test('the logo remains a working visible home link without JavaScript',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:4321/darcy');
  await page.locator('#site-header .site-wordmark').click();
  await expect(page).toHaveURL(/\/#hero$/);
  await expect(page.locator('.hero-copy')).toHaveCSS('opacity','1');
  await expect(page.locator('.hero-media')).toHaveCSS('opacity','1');
  await expect(page.getByRole('heading',{level:1})).toBeVisible();
  await context.close();
});

for(const source of ['about','contact'])for(const reduced of [false,true])test(`${source} logo uses the shared home entrance with reduced motion ${reduced}`,async({page})=>{
 await observe(page);
 if(reduced)await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/'+source);
 await page.locator('#site-header .site-wordmark').click();
 await settledHome(page);
 const entrances=(await events(page)).filter(entry=>['native','fallback'].includes(entry.phase));
 expect(entrances).toHaveLength(reduced?0:1);
});
