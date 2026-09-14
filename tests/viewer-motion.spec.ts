import { test, expect } from '@playwright/test';

test('a photograph expands from its real crop and returns with a shorter transition',async({page})=>{
  await page.goto('/crestmontwest');
  const origin=page.locator('.primary-figure [data-gallery-index]');
  await origin.click();
  await expect(page.locator('#viewer-count')).toHaveText('1 / 7');
  await expect(page.locator('.viewer-motion-proxy')).toHaveCount(1);
  const opening=await page.locator('.viewer-motion-proxy img').evaluate(el=>{
    const animation=el.getAnimations()[0];
    return {frames:(animation.effect as KeyframeEffect).getKeyframes(),duration:animation.effect?.getTiming().duration,source:(el as HTMLImageElement).src};
  });
  expect(opening.duration).toBe(420);
  expect(opening.frames[0].transform).not.toBe(opening.frames[1].transform);
  expect(opening.source).toContain('/gallery/crestmont-west/1.webp');
  expect(await page.locator('.viewer-toolbar').evaluate(el=>getComputedStyle(el).transform)).toBe('none');
  await expect(page.locator('.viewer-motion-proxy')).toHaveCount(0);
  await page.locator('#viewer-close').dispatchEvent('click');
  await expect(page.locator('.viewer-motion-proxy')).toHaveCount(1);
  expect(await page.locator('.viewer-motion-proxy img').evaluate(el=>el.getAnimations()[0].effect?.getTiming().duration)).toBe(260);
  await expect(page.locator('#image-viewer')).not.toBeVisible();
  await expect(page.locator('.viewer-motion-proxy')).toHaveCount(0);
  await expect(origin).toBeFocused();
  await expect(page.locator('html')).not.toHaveCSS('overflow','hidden');
});

test('closing during expansion and reopening during dismissal resolve to the latest input',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/crestmontwest');
  const origin=page.locator('.primary-figure [data-gallery-index]');
  await origin.click();
  await expect(page.locator('.viewer-motion-proxy')).toHaveCount(1);
  const reversal=await page.evaluate(()=>{
    const moving=document.querySelector<HTMLImageElement>('.viewer-motion-proxy img')!;
    moving.getAnimations()[0].pause();
    const before=moving.getBoundingClientRect();
    document.querySelector<HTMLButtonElement>('#viewer-close')!.click();
    const after=document.querySelector<HTMLImageElement>('.viewer-motion-proxy img')!.getBoundingClientRect();
    return {before:{x:before.x,y:before.y,width:before.width},after:{x:after.x,y:after.y,width:after.width}};
  });
  expect(Math.abs(reversal.before.x-reversal.after.x)).toBeLessThan(1);
  expect(Math.abs(reversal.before.y-reversal.after.y)).toBeLessThan(1);
  expect(Math.abs(reversal.before.width-reversal.after.width)).toBeLessThan(1);
  await origin.dispatchEvent('click');
  await expect(page.locator('#viewer-count')).toHaveText('1 / 7');
  await expect(page.locator('.viewer-motion-proxy')).toHaveCount(0);
  await expect(page.locator('#image-viewer')).toBeVisible();
  await expect(page.locator('#viewer-image')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#viewer-count')).toHaveText('2 / 7');
  await page.locator('#viewer-close').dispatchEvent('click');
  // A different selected image has no relationship to the opening crop.
  await expect(page.locator('.viewer-motion-proxy')).toHaveCount(0);
  await expect(page.locator('#image-viewer')).not.toBeVisible();
  await expect(page.locator('.viewer-previous-image')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('live reduced motion settles the expansion and retains usable image controls',async({page})=>{
  await page.goto('/crestmontwest');
  await page.locator('.primary-figure [data-gallery-index]').click();
  await expect(page.locator('.viewer-motion-proxy')).toHaveCount(1);
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('.viewer-motion-proxy')).toHaveCount(0);
  await expect(page.locator('#viewer-image')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#viewer-count')).toHaveText('2 / 7');
  expect(await page.locator('#viewer-image').evaluate(el=>el.getAnimations().every(animation=>(animation.effect as KeyframeEffect).getKeyframes().every(frame=>!frame.transform)))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.locator('#image-viewer')).not.toBeVisible();
  await page.locator('#motion-choice').selectOption('off');
  await page.locator('.primary-figure [data-gallery-index]').click();
  await expect(page.locator('#viewer-count')).toHaveText('1 / 7');
  await expect(page.locator('.viewer-motion-proxy')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('#image-viewer')).not.toBeVisible();
});

test('a late image decode cannot overwrite a reopened gallery',async({page})=>{
  let release!:()=>void;
  const held=new Promise<void>(resolve=>release=resolve);
  await page.route('**/gallery/crestmont-west/2.webp',async route=>{await held;await route.continue();});
  await page.goto('/crestmontwest',{waitUntil:'domcontentloaded'});
  await page.locator('.primary-figure [data-gallery-index]').click();
  await expect(page.locator('#viewer-count')).toHaveText('1 / 7');
  await page.locator('#viewer-next').dispatchEvent('click');
  await expect(page.locator('#viewer-status')).toContainText('Loading');
  await page.locator('#viewer-close').dispatchEvent('click');
  await expect(page.locator('#image-viewer')).not.toBeVisible();
  await page.locator('.primary-figure [data-gallery-index]').click();
  await expect(page.locator('#viewer-count')).toHaveText('1 / 7');
  release();
  await expect(page.locator('#viewer-image')).toHaveAttribute('src','/media/gallery/crestmont-west/1.webp');
  await expect(page.locator('.viewer-motion-proxy')).toHaveCount(0);
  await expect(page.locator('#viewer-count')).toHaveText('1 / 7');
  await page.keyboard.press('Escape');
  await expect(page.locator('#image-viewer')).not.toBeVisible();
});

test('hero controls retain the frame, show drawings in full and open the selected image',async({page})=>{
  await page.goto('/crestmontwest');
  await expect(page.locator('html')).toHaveAttribute('data-project-arrival', /^(done|skipped)$/);
  const link=page.locator('.primary-figure .gallery-link');
  const image=page.locator('.primary-figure img[data-primary-project]');
  const firstFrame=await link.boundingBox();
  const firstTitle=await page.locator('h1').evaluate(el=>el.getBoundingClientRect().top+scrollY);
  await page.locator('#project-hero-next').click();
  await expect(page.locator('#project-hero-count')).toHaveText('02 / 07');
  await expect(link).toHaveAttribute('data-gallery-index','1');
  const chosenCaption=await image.getAttribute('alt');
  await expect(page.locator('.primary-figure [data-figure-caption]')).toHaveText(chosenCaption!);
  expect((await link.boundingBox())!.height).toBeCloseTo(firstFrame!.height,0);
  expect(await page.locator('h1').evaluate(el=>el.getBoundingClientRect().top+scrollY)).toBeCloseTo(firstTitle,0);
  await link.click();
  await expect(page.locator('#viewer-count')).toHaveText('2 / 7');
  await expect(page.locator('#viewer-image')).toHaveAttribute('src','/media/gallery/crestmont-west/2.webp');
  await expect(page.locator('#viewer-caption')).toHaveText(chosenCaption!);
  await page.keyboard.press('Escape');
  await expect(page.locator('#image-viewer')).not.toBeVisible();
  await page.locator('#project-hero-previous').click();
  await expect(page.locator('#project-hero-count')).toHaveText('01 / 07');
  await page.locator('#project-hero-previous').click();
  await expect(page.locator('#project-hero-count')).toHaveText('07 / 07');
  await expect(page.locator('.primary-figure .image-medium')).toHaveText('Drawing');
  await expect(image).toHaveCSS('object-fit','contain');
  expect((await link.boundingBox())!.height).toBeCloseTo(firstFrame!.height,0);
  await expect(page.locator('.hero-previous-image')).toHaveCount(0);
});

test('a missing source uses a fade and returns keyboard focus to a valid control',async({page})=>{
  await page.goto('/crestmontwest');
  await page.locator('.primary-figure [data-gallery-index]').click();
  await expect(page.locator('.viewer-motion-proxy')).toHaveCount(0);
  await page.locator('.primary-figure .gallery-link').evaluate(el=>el.remove());
  await page.locator('#viewer-close').dispatchEvent('click');
  await expect(page.locator('.viewer-motion-proxy')).toHaveCount(0);
  await expect(page.locator('#image-viewer')).not.toBeVisible();
  await expect(page.locator('[data-back-projects]').first()).toBeFocused();
});

test('opening the current hero cancels a pending carousel replacement',async({page})=>{
  let release!:()=>void;
  const held=new Promise<void>(resolve=>release=resolve);
  await page.route('**/gallery/crestmont-west/2.webp',async route=>{await held;await route.continue();});
  await page.goto('/crestmontwest',{waitUntil:'domcontentloaded'});
  await page.locator('#project-hero-next').click();
  await expect(page.locator('#project-hero-status')).toContainText('Loading');
  await expect(page.locator('.primary-figure .gallery-link')).toHaveAttribute('data-gallery-index','0');
  await page.locator('.primary-figure .gallery-link').click();
  await expect(page.locator('#viewer-count')).toHaveText('1 / 7');
  release();
  await expect(page.locator('.viewer-motion-proxy')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('#image-viewer')).not.toBeVisible();
  await expect(page.locator('.primary-figure .gallery-link')).toHaveAttribute('data-gallery-index','0');
  await expect(page.locator('#project-hero-status')).toHaveText('');
});

test('mobile hero captions and controls remain still across every photograph and drawing',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/crestmontwest');
  await page.locator('#project-hero-next').scrollIntoViewIfNeeded();
  const positions:number[]=[];
  const heights:number[]=[];
  for(let index=0;index<7;index++){
    await expect(page.locator('#project-hero-count')).toHaveText(`${String(index+1).padStart(2,'0')} / 07`);
    positions.push(await page.locator('.project-hero-controls').evaluate(el=>el.getBoundingClientRect().top+scrollY));
    heights.push(await page.locator('.project-hero-gallery').evaluate(el=>el.getBoundingClientRect().height));
    await page.locator('#project-hero-next').click();
  }
  expect(Math.max(...positions)-Math.min(...positions)).toBeLessThan(1);
  expect(Math.max(...heights)-Math.min(...heights)).toBeLessThan(1);
});

test('viewer media shortcuts return to the last image and preserve drawing zoom on mobile',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/crestmontwest');
  await page.locator('.primary-figure .gallery-link').click();
  await page.locator('#viewer-next').click();
  await expect(page.locator('#viewer-count')).toHaveText('2 / 7');
  await page.getByRole('button',{name:'Drawings',exact:true}).click();
  await expect(page.locator('#viewer-count')).toHaveText('7 / 7');
  await expect(page.getByRole('button',{name:'Drawings',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Zoom in',exact:true}).click();
  await expect(page.locator('#image-viewer')).toHaveAttribute('data-zoomed','');
  await page.getByRole('button',{name:'Images',exact:true}).click();
  await expect(page.locator('#viewer-count')).toHaveText('2 / 7');
  await expect(page.locator('#image-viewer')).not.toHaveAttribute('data-zoomed','');
  await expect(page.locator('#viewer-close')).toBeInViewport();
  await page.keyboard.press('Escape');
  await expect(page.locator('#image-viewer')).not.toBeVisible();
});
