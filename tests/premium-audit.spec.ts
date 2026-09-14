import {test,expect} from '@playwright/test';

test('featured views keep the chosen photographs and copy together after rapid input',async({page})=>{
  await page.goto('/');
  const image=page.locator('[data-featured-image]');
  await page.locator('[data-featured-view="play"]').click();
  await expect(image).toHaveAttribute('src','/media/gallery/crestmont-west/7.webp');
  await expect(page.locator('[data-featured-detail]')).toHaveAttribute('src','/media/gallery/crestmont-west/4.webp');
  await expect(page.locator('[data-featured-copy]')).toContainText('Play equipment and timber seating');
  await page.locator('[data-featured-view="planting"]').dispatchEvent('click');
  await page.locator('[data-featured-view="courtyard"]').dispatchEvent('click');
  await expect(page.locator('[data-featured-view="courtyard"]')).toHaveAttribute('aria-selected','true');
  await expect(image).toHaveAttribute('src','/media/featured-crestmont.webp');
  await expect(page.locator('[data-featured-detail]')).toHaveAttribute('src','/media/img_2304.webp');
  await expect(page.locator('[data-featured-copy]')).toContainText('A planted courtyard connects the homes');
  await expect(page.locator('.featured-outgoing')).toHaveCount(0);
  await page.locator('[data-featured-view="courtyard"]').focus();await page.keyboard.press('End');
  await expect(page.locator('[data-featured-view="planting"]')).toBeFocused();
  await expect(image).toHaveAttribute('src','/media/gallery/crestmont-west/8.webp');
  await expect(page.locator('[data-featured-detail]')).toHaveAttribute('src','/media/gallery/crestmont-west/5.webp');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('.featured-outgoing')).toHaveCount(0);
  await expect.poll(()=>page.locator('#featured').evaluate(element=>element.getAnimations({subtree:true}).filter(animation=>animation.playState==='running').length)).toBe(0);
});

test('featured photo failure leaves the last complete view available',async({page})=>{
  await page.route('**/gallery/crestmont-west/7.webp',route=>route.abort());
  await page.goto('/');await page.locator('[data-featured-view="play"]').click();
  await expect(page.locator('.featured-status')).toContainText('could not be loaded');
  await expect(page.locator('[data-featured-image]')).toHaveAttribute('src','/media/featured-crestmont.webp');
  await expect(page.locator('[data-featured-view="courtyard"]')).toHaveAttribute('aria-selected','true');
  await page.locator('[data-featured-view="planting"]').click();
  await expect(page.locator('[data-featured-image]')).toHaveAttribute('src','/media/gallery/crestmont-west/8.webp');
  await expect(page.locator('.featured-status')).toBeEmpty();
});

test('continuous borders align with the content frame and headings never use all-caps styling',async({page})=>{
  for(const width of [320,390,768,1440,1920]){
    await page.setViewportSize({width,height:1000});await page.goto('/');
    const frame=await page.evaluate(()=>{
      const body=getComputedStyle(document.body,'::before'),hero=document.querySelector('.hero-main')!.getBoundingClientRect(),section=document.querySelector('#services')!.getBoundingClientRect();
      const uppercase=[...document.querySelectorAll('h1,h2,h3,button,.site-wordmark')].filter(element=>getComputedStyle(element).textTransform==='uppercase').length;
      return {rule:parseFloat(body.width),hero:hero.width,section:section.width,overflow:document.documentElement.scrollWidth>innerWidth,uppercase};
    });
    expect(frame.rule).toBeCloseTo(frame.hero,0);expect(frame.hero).toBeCloseTo(frame.section,0);expect(frame.overflow).toBe(false);expect(frame.uppercase).toBe(0);
    await expect(page.locator('.hero .outline-button')).toBeInViewport();
  }
});
