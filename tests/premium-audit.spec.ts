import {test,expect} from '@playwright/test';

test('featured projects keep the chosen photographs and copy together after rapid input',async({page})=>{
  await page.goto('/');
  const image=page.locator('[data-featured-image]');
  await page.locator('[data-featured-view="darcy"]').click();
  await expect(image).toHaveAttribute('src','/media/gallery/darcy/usb-img_2484.webp');
  await expect(page.locator('[data-featured-detail]')).toHaveAttribute('src','/media/gallery/darcy/usb-img_2490.webp');
  await expect(page.locator('[data-featured-copy]')).toContainText('Front gardens, flowering planting');
  await page.locator('[data-featured-view="seton-crossing"]').dispatchEvent('click');
  await page.locator('[data-featured-view="crestmont-west"]').dispatchEvent('click');
  await expect(page.locator('[data-featured-view="crestmont-west"]')).toHaveAttribute('aria-selected','true');
  await expect(image).toHaveAttribute('src','/media/featured-crestmont.webp');
  await expect(page.locator('[data-featured-detail]')).toHaveAttribute('src','/media/img_2304.webp');
  await expect(page.locator('[data-featured-copy]')).toContainText('A planted courtyard connects the homes');
  await expect(page.locator('.featured-outgoing')).toHaveCount(0);
  await page.locator('[data-featured-view="crestmont-west"]').focus();await page.keyboard.press('End');
  await expect(page.locator('[data-featured-view="seton-crossing"]')).toBeFocused();
  await expect(image).toHaveAttribute('src','/media/gallery/seton-crossing/2.webp');
  await expect(page.locator('[data-featured-detail]')).toHaveAttribute('src','/media/gallery/seton-crossing/usb-img_2443.webp');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('.featured-outgoing')).toHaveCount(0);
  await expect.poll(()=>page.locator('#featured').evaluate(element=>element.getAnimations({subtree:true}).filter(animation=>animation.playState==='running').length)).toBe(0);
});

test('featured photo failure leaves the last complete view available',async({page})=>{
  await page.route('**/gallery/darcy/usb-img_2484.webp',route=>route.abort());
  await page.goto('/');await page.locator('[data-featured-view="darcy"]').click();
  await expect(page.locator('.featured-status')).toContainText('could not be loaded');
  await expect(page.locator('[data-featured-image]')).toHaveAttribute('src','/media/featured-crestmont.webp');
  await expect(page.locator('[data-featured-view="crestmont-west"]')).toHaveAttribute('aria-selected','true');
  await page.locator('[data-featured-view="seton-crossing"]').click();
  await expect(page.locator('[data-featured-image]')).toHaveAttribute('src','/media/gallery/seton-crossing/2.webp');
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
