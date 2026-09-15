import {test,expect} from '@playwright/test';

test('filter changes visibly animate, latest input wins, and reduced mode settles results',async({page})=>{
  await page.goto('/');
  await page.locator('[data-filter="commercial"]').click();
  await expect(page.locator('.project-entry:visible')).toHaveCount(3);
  const incoming=await page.locator('#project-collection').evaluate(element=>({
    opacity:Number(getComputedStyle(element).opacity),
    frames:element.getAnimations().filter(animation=>animation.playState==='running').map(animation=>(animation.effect as KeyframeEffect).getKeyframes()),
  }));
  expect(incoming.opacity).toBeLessThan(1);
  expect(incoming.frames.some(frames=>frames.some(frame=>String(frame.transform).includes('14px')))).toBe(true);
  for(const category of ['multifamily','single-homes','commercial']){
    await page.locator(`[data-filter="${category}"]`).dispatchEvent('click');
    await page.waitForTimeout(50);
  }
  await expect(page.locator('#project-collection')).toHaveAttribute('data-filter-transition','done');
  await expect(page.locator('.project-entry:visible')).toHaveCount(3);
  await expect(page.locator('#project-collection')).toHaveCSS('opacity','1');
  await page.locator('#project-search').fill('no such project');
  await expect(page.locator('#project-empty')).toBeVisible();
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('#reset-projects').click();
  await expect(page.locator('.project-entry:visible')).toHaveCount(30);
  await expect.poll(()=>page.locator('#project-collection').evaluate(element=>element.getAnimations().filter(animation=>animation.playState==='running').length)).toBe(0);
});

test('contact photograph moves only while visible and full motion is enabled',async({page})=>{
  await page.goto('/');
  const panel=page.locator('.contact-panel');
  await panel.scrollIntoViewIfNeeded();
  await expect(panel).toHaveAttribute('data-camera-motion','moving');
  const first=await panel.locator('img').evaluate(element=>getComputedStyle(element).transform);
  const links=await panel.locator('.contact-panel-content').boundingBox();
  await page.waitForTimeout(400);
  expect(await panel.locator('img').evaluate(element=>getComputedStyle(element).transform)).not.toBe(first);
  await expect(page.locator('[data-reveal-state="running"]')).toHaveCount(0);
  const settled=await panel.locator('.contact-panel-content').boundingBox();
  await page.waitForTimeout(200);
  expect(await panel.locator('.contact-panel-content').boundingBox()).toEqual(settled);
  expect(links!.width).toBe(settled!.width);
  await page.locator('#hero').scrollIntoViewIfNeeded();
  await expect(panel).toHaveAttribute('data-camera-motion','paused');
  await panel.scrollIntoViewIfNeeded();
  await expect(panel).toHaveAttribute('data-camera-motion','moving');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(panel).toHaveAttribute('data-camera-motion','still');
  await expect(panel.locator('img')).toHaveCSS('transform','none');
  expect(await panel.locator('img').evaluate(element=>element.getAnimations().length)).toBe(0);
});
