import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('project opens locally, gallery responds to rapid input, zoom and Escape return focus',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/crestmontwest');
  await expect(page.locator('h1')).toHaveText('Crestmont West');
  await expect(page.locator('[data-primary-project]')).toBeVisible();
  await page.locator('[data-gallery-index="0"]').click();
  const dialog=page.getByRole('dialog',{name:'Project image gallery'});
  await expect(dialog).toBeVisible();await expect(page.locator('#viewer-count')).toHaveText('1 / 13');
  await page.keyboard.press('ArrowRight');await expect(page.locator('#viewer-count')).toHaveText('2 / 13');
  await page.locator('#viewer-next').dispatchEvent('click');await page.locator('#viewer-next').dispatchEvent('click');await page.locator('#viewer-next').dispatchEvent('click');
  await expect(page.locator('#viewer-count')).toHaveText('5 / 13');
  await expect(page.locator('#viewer-image')).toHaveAttribute('src','/media/gallery/crestmont-west/8.webp');
  await page.getByRole('button',{name:'Zoom in',exact:true}).click();
  await expect(dialog).toHaveAttribute('data-zoomed','');
  await page.getByRole('button',{name:'Zoom out',exact:true}).click();
  await expect(dialog).not.toHaveAttribute('data-zoomed','');
  await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();
  await expect(page.locator('[data-gallery-index="0"]')).toBeFocused();
  await page.locator('.gallery-link[data-gallery-index="6"]').click();
  await expect(dialog).toHaveAttribute('data-medium','drawing');
  await expect(page.locator('#viewer-medium')).toHaveText('Drawing');
  await page.locator('#viewer-close').click();await expect(dialog).not.toBeVisible();
  expect(errors).toEqual([]);
});

test('image failure remains recoverable and full-screen viewer traps keyboard focus',async({page})=>{
  await page.route('**/gallery/crestmont-west/2.webp',route=>route.abort());
  await page.goto('/crestmontwest');
  await page.locator('[data-gallery-index="0"]').click();await expect(page.locator('#viewer-count')).toHaveText('1 / 13');
  await page.keyboard.press('ArrowRight');await expect(page.locator('#viewer-status')).toContainText('could not be loaded');
  await expect(page.locator('#viewer-count')).toHaveText('1 / 13');
  for(let i=0;i<9;i++){await page.keyboard.press('Tab');expect(await page.evaluate(()=>document.activeElement?.closest('dialog')?.id)).toBe('image-viewer');}
  await page.keyboard.press('ArrowLeft');await expect(page.locator('#viewer-count')).toHaveText('13 / 13');
  await page.keyboard.press('Escape');await expect(page.locator('html')).not.toHaveCSS('overflow','hidden');
});

test('back to projects retains search, view and selected project position',async({page})=>{
  await page.goto('/?category=commercial&q=seton&view=index#projects');
  await page.locator('[data-project="seton-crossing"] a').click();await expect(page).toHaveURL(/\/seton\/?$/);
  await page.locator('[data-back-projects]').last().click();
  await expect(page.locator('#project-search')).toHaveValue('seton');await expect(page.locator('#project-collection')).toHaveAttribute('data-view','index');
  await expect(page.locator('.project-entry:visible')).toHaveCount(2);
  await expect(page.locator('[data-project="seton-crossing"] a')).toBeFocused();
  expect(await page.locator('[data-project="seton-crossing"] a').evaluate(el=>{const b=el.getBoundingClientRect();return b.top>=0&&b.bottom<innerHeight;})).toBe(true);
});

test('back to projects keeps archive state before the project enhancement finishes loading',async({page})=>{
  let releaseProject:()=>void=()=>{};
  let projectRequested:()=>void=()=>{};
  const held=new Promise<void>(resolve=>{releaseProject=resolve;});
  const requested=new Promise<void>(resolve=>{projectRequested=resolve;});
  await page.route('**/src/scripts/project.ts*',async route=>{
    projectRequested();
    await held;
    await route.continue().catch(()=>{});
  });
  try {
    await page.goto('/?category=commercial&q=seton&view=index#projects');
    await page.locator('[data-project="seton-crossing"] a').click();
    await expect(page).toHaveURL(/\/seton\/?$/);
    await requested;
    await page.locator('[data-back-projects]').last().click();
    releaseProject();
    await expect(page.locator('#project-search')).toHaveValue('seton');
    await expect(page.locator('#project-collection')).toHaveAttribute('data-view','index');
    await expect(page.locator('.project-entry:visible')).toHaveCount(2);
    await expect(page.locator('[data-project="seton-crossing"] a')).toBeFocused();
  } finally { releaseProject(); }
});

test('direct project entry supports home navigation, next project and static fallback',async({page,browser})=>{
  await page.goto('/crestmontwest');await page.locator('.next-project-link').click();await expect(page.locator('h1')).toHaveText('Arbour Lake');
  await page.locator('[data-back-projects]').first().click();await expect(page.locator('#project-collection')).toBeVisible();
  const context=await browser.newContext({javaScriptEnabled:false});const plain=await context.newPage();
  await plain.goto('http://127.0.0.1:4321/crestmontwest');await expect(plain.locator('h1')).toBeVisible();
  await expect(plain.locator('.gallery-link')).toHaveCount(13);await expect(plain.locator('.gallery-link').first()).toHaveAttribute('href','/media/gallery/crestmont-west/1.webp');
  await context.close();
});

test('mobile project page, gallery and drawing fit; reduced motion is respected',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/crestmontwest');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.locator('.gallery-link[data-gallery-index="6"]').click();await expect(page.locator('#viewer-medium')).toHaveText('Drawing');
  await expect(page.locator('#viewer-close')).toBeInViewport();await expect(page.locator('#viewer-next')).toBeInViewport();
  await expect.poll(()=>page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length)).toBe(0);
  await page.keyboard.press('Escape');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('project and full-screen gallery pass accessibility checks',async({page})=>{
  await page.goto('/crestmontwest');
  await page.locator('#motion-choice').selectOption('off');await page.evaluate(()=>scrollTo(0,0));
  for(let i=0;i<2;i++){
    if(i) {await page.locator('[data-gallery-index="0"]').click();await expect(page.locator('#viewer-count')).toHaveText('1 / 13');}
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
  }
});

test('home sections visibly fade, finish once, and all project results stay usable after filtering',async({page})=>{
  await page.goto('/');
  await expect(page.locator('#services-title')).toHaveAttribute('data-reveal-state','pending');
  await page.locator('#services').evaluate(el=>el.scrollIntoView());
  await expect.poll(()=>page.locator('#services-title').evaluate(el=>getComputedStyle(el).opacity)).toBe('1');
  await expect(page.locator('#services-title')).toHaveAttribute('data-reveal-state','done');
  await page.locator('#hero').evaluate(el=>el.scrollIntoView());await page.locator('#services').evaluate(el=>el.scrollIntoView());
  await expect(page.locator('#services-title')).toHaveAttribute('data-reveal-state','done');
  await page.locator('[data-filter="commercial"]').click();await page.locator('button[data-view="index"]').click();
  await expect(page.locator('.project-entry:visible')).toHaveCount(3);
  await expect.poll(()=>page.locator('.project-entry:visible').evaluateAll(els=>els.every(el=>getComputedStyle(el).opacity==='1'))).toBe(true);
});

test('mobile service photographs expand on touch and a collapsed choice restores on desktop',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/');
  await page.locator('[data-service-panel="commercial"]').click({position:{x:80,y:45}});
  await expect(page.locator('#tab-commercial')).toHaveAttribute('aria-expanded','true');
  await expect(page.locator('#service-commercial')).toBeVisible();
  await page.locator('#tab-commercial').click();await expect(page.locator('#tab-commercial')).toHaveAttribute('aria-expanded','false');
  await page.setViewportSize({width:1440,height:900});await expect(page.locator('#tab-multifamily')).toHaveAttribute('aria-expanded','true');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('project search opens over the current project and finds another project directly',async({page})=>{
  await page.goto('/crestmontwest');await page.locator('.site-header__utilities [data-project-search]').click();
  await expect(page).toHaveURL(/\/crestmontwest$/);
  await expect(page.locator('#site-search-input')).toBeFocused();await page.locator('#site-search-input').fill('Evanston');
  await expect(page.locator('[data-search-project]:visible')).toHaveCount(1);
  await page.locator('[data-search-project="evanston"]').click();await expect(page).toHaveURL(/\/evanston$/);
});
