import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('archive photograph fills its rounded card smoothly while text and nearby rows stay in place',async({page})=>{
  await page.goto('/');
  const card=page.locator('[data-project="darcy"] .project-link');
  await card.scrollIntoViewIfNeeded();
  await page.mouse.move(0,0);
  await expect(page.locator('[data-reveal-state="running"]')).toHaveCount(0);
  await expect.poll(()=>card.locator('img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
  const before=await card.boundingBox();
  const picture=await card.locator('.project-image').boundingBox();
  const row=page.locator('[data-project="crestmont-west"]');
  const nextRow=await row.boundingBox();
  await expect(card.locator('.project-brief')).toBeVisible();
  await expect(card.locator('.project-media-details')).toHaveCSS('opacity','0');
  expect(await card.locator('img').evaluate(element=>parseFloat(getComputedStyle(element).transitionDuration))).toBeGreaterThanOrEqual(.65);
  await card.hover();
  await expect(card.locator('.project-media-details')).toHaveCSS('opacity','1');
  await expect(card.locator('.project-brief')).toHaveText('Front gardens and street planting connect individual homes to the neighbourhood.');
  await expect(card.locator('.project-media-details')).toHaveText('6 ViewsPhotography & Drawings');
  await expect(card.locator('.project-open')).toHaveCSS('opacity','1');
  await expect(card.locator('.project-information')).toHaveCSS('color','rgb(255, 255, 255)');
  expect(await card.locator('.project-image').boundingBox()).toEqual(picture);
  await expect.poll(async()=> (await card.locator('img').boundingBox())!.height).toBeGreaterThan(before!.height);
  expect((await card.locator('.project-more').boundingBox())!.y).toBeGreaterThan(picture!.y+picture!.height);
  await expect(card.locator('.project-image-shade')).toHaveCSS('opacity','1');
  expect(await card.boundingBox()).toEqual(before);
  expect((await row.boundingBox())!.y).toBe(nextRow!.y);
  await page.locator('button[data-view="index"]').click();
  await expect(page.locator('#project-collection')).toHaveAttribute('data-view','index');
  expect((await card.locator('.project-image').boundingBox())!.width).toBe(92);
  await expect(card.locator('.project-open')).not.toBeVisible();
  await expect(card.locator('.project-more')).not.toBeVisible();
  await page.locator('button[data-view="grid"]').click();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(card).toBeFocused();
  await expect(card.locator('.project-media-details')).toHaveCSS('opacity','1');
  await expect(card.locator('.project-information')).toHaveCSS('color','rgb(255, 255, 255)');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/darcy$/);
  await expect(page.locator('h1')).toHaveText('D’Arcy');
});

test('archive drawing facts stay truthful, reduced motion settles, and touch opens on the first tap',async({page,browser})=>{
  await page.goto('/');
  const card=page.locator('[data-project="rona"] .project-link');
  await card.hover();
  await expect(card.locator('.project-media-details')).toHaveCSS('opacity','1');
  await expect(card.locator('.project-media-details')).toHaveText('3 ViewsLandscape Drawings');
  await expect(card.locator('.project-brief')).toContainText('existing and proposed planted areas');
  await expect(card.locator('.project-information')).toHaveCSS('color','rgb(255, 255, 255)');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect.poll(()=>card.evaluate(element=>element.getAnimations({subtree:true}).filter(animation=>animation.playState==='running').length)).toBe(0);
  await expect(card.locator('img')).toHaveCSS('transform','none');
  const accessibility=await new AxeBuilder({page}).include('[data-project="rona"]').analyze();
  expect(accessibility.violations).toEqual([]);
  const touchContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  try{
    const touch=await touchContext.newPage();await touch.goto(new URL('/',page.url()).href);
    const touchCard=touch.locator('[data-project="darcy"] .project-link');await touchCard.scrollIntoViewIfNeeded();
    await expect(touchCard.locator('.project-media-details')).toHaveCSS('opacity','1');
    await expect(touchCard.locator('.project-brief')).toBeVisible();
    await touchCard.tap();await expect(touch).toHaveURL(/\/darcy$/);
    await expect(touch.locator('h1')).toHaveText('D’Arcy');
  }finally{await touchContext.close();}
});

test('rounded contact and footer fit small screens and keep the real contact links',async({page})=>{
  for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:1000});
    await page.goto('/');
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await expect(page.locator('#contact .contact-start')).toBeVisible();
    await expect(page.locator('#contact a[href="tel:+14035104071"]')).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const filters=page.locator('.project-filters');
    const headingHeight=await page.locator('.projects-heading').evaluate(element=>element.getBoundingClientRect().height);
    const filterBounds=await filters.boundingBox();
    for(const button of await filters.locator('button').all()){
      const box=await button.boundingBox();
      expect(box!.x+box!.width).toBeLessThanOrEqual(filterBounds!.x+filterBounds!.width+1);
    }
    await filters.getByRole('button',{name:'Single Homes'}).click();
    expect(await page.locator('.projects-heading').evaluate(element=>element.getBoundingClientRect().height)).toBeCloseTo(headingHeight,1);
    const selected=await filters.getByRole('button',{name:'Single Homes'}).boundingBox();
    const indicator=await filters.locator('.filter-indicator').boundingBox();
    expect(indicator!.y).toBeCloseTo(selected!.y+selected!.height-1,0);
    await page.locator('#contact').scrollIntoViewIfNeeded();
    expect(await page.locator('.contact-panel').evaluate(element=>parseFloat(getComputedStyle(element).borderRadius))).toBeGreaterThanOrEqual(18);
    const contact=await page.locator('.contact-panel').boundingBox();
    for(const link of await page.locator('#contact a').all()){
      const box=await link.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(contact!.x);
      expect(box!.x+box!.width).toBeLessThanOrEqual(contact!.x+contact!.width+1);
    }
  }
  const accessibility=await new AxeBuilder({page}).include('#contact').include('footer').analyze();
  expect(accessibility.violations).toEqual([]);
  await page.locator('.footer-return').click();
  await expect(page.locator('#hero')).toBeInViewport();
});
