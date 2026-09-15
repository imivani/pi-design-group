import {test,expect} from '@playwright/test';

test('featured choices keep paired photographs together without moving their controls',async({page})=>{
  await page.goto('/');
  const controls=page.locator('.featured-controls');
  const first=page.locator('[data-featured-view="crestmont-west"]');
  await first.scrollIntoViewIfNeeded();
  await expect(page.locator('.featured-presentation')).toHaveAttribute('data-reveal-state','done');
  const measure=()=>controls.evaluate(element=>element.getBoundingClientRect().top-element.closest('#featured')!.getBoundingClientRect().top);
  const before=await measure();
  await page.locator('[data-featured-view="darcy"]').hover();
  await expect(page.locator('[data-featured-image]')).toHaveAttribute('src','/media/gallery/darcy/usb-img_2484.webp');
  await expect(page.locator('[data-featured-detail]')).toHaveAttribute('src','/media/gallery/darcy/usb-img_2490.webp');
  await expect(page.locator('[data-featured-view="darcy"]')).toHaveAttribute('aria-selected','true');
  expect(await measure()).toBeCloseTo(before,1);
  await first.hover();
  await expect(page.locator('[data-featured-image]')).toHaveAttribute('src','/media/featured-crestmont.webp');
  await expect(page.locator('[data-featured-detail]')).toHaveAttribute('src','/media/img_2304.webp');
  await expect(page.locator('.featured-outgoing')).toHaveCount(0);
});

test('the dark featured section keeps its project hierarchy, overlapping photos and controls readable',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('pi-motion','off'));
  for(const width of [320,390,768,1024,1440,1920]){
    await page.setViewportSize({width,height:1000});await page.goto('/');
    const dimensions=await page.locator('#featured').evaluate(section=>{
      const bounds=section.getBoundingClientRect();
      const main=section.querySelector('.featured-photo')!.getBoundingClientRect();
      const detail=section.querySelector('.featured-detail-photo')!.getBoundingClientRect();
      const link=section.querySelector('.featured-project-link')!.getBoundingClientRect();
      const heading=section.querySelector('#featured-title')!;
      return {
        width:bounds.width,
        contentWidth:section.parentElement!.getBoundingClientRect().width,
        background:getComputedStyle(section).backgroundColor,
        label:parseFloat(getComputedStyle(heading).fontSize),
        name:parseFloat(getComputedStyle(section.querySelector('.featured-project-name')!).fontSize),
        radius:parseFloat(getComputedStyle(section.querySelector('.featured-photo')!).borderRadius),
        photoShare:main.width/section.querySelector('.featured-card')!.getBoundingClientRect().width,
        overlapping:detail.top<main.bottom&&detail.bottom>main.bottom&&detail.right>main.left&&detail.left<main.right,
        acrossLeftEdge:detail.left<main.left&&detail.right>main.left,
        clearAction:detail.left>=link.right||detail.right<=link.left||detail.top>=link.bottom||detail.bottom<=link.top,
        filter:getComputedStyle(section.querySelector('[data-featured-image]')!).filter,
        outside:[...section.querySelectorAll('a,button')].filter(control=>{const rect=control.getBoundingClientRect();return rect.left<bounds.left||rect.right>bounds.right;}).length,
        overflow:document.documentElement.scrollWidth>innerWidth,
      };
    });
    expect(dimensions.width).toBe(dimensions.contentWidth);
    expect(dimensions.background.match(/\d+/g)!.slice(0,3).map(Number).every(channel=>channel<60)).toBe(true);
    expect(dimensions.label).toBeGreaterThanOrEqual(20);expect(dimensions.label).toBeLessThanOrEqual(32);
    expect(dimensions.name).toBeGreaterThan(dimensions.label*1.6);
    expect(dimensions.radius).toBeLessThanOrEqual(8);
    expect(dimensions.overlapping).toBe(true);expect(dimensions.clearAction).toBe(true);
    expect(dimensions.outside).toBe(0);expect(dimensions.overflow).toBe(false);expect(dimensions.filter).toBe('none');
    if(width>=1000){expect(dimensions.photoShare).toBeGreaterThan(.59);expect(dimensions.acrossLeftEdge).toBe(true);}
    await expect(page.locator('[data-featured-view]')).toHaveCount(3);
    await expect(page.locator('[data-featured-previous],[data-featured-next]')).toHaveCount(2);
    await expect(page.locator('#featured-title')).toHaveText('Featured Projects');
    await expect(page.locator('.featured-project-name')).toHaveText('Crestmont West');
  }
});

test('previous and next advance complete views and rapid input settles on the latest choice',async({page})=>{
  await page.goto('/');
  const next=page.getByRole('button',{name:'Next featured project',exact:true});
  const previous=page.getByRole('button',{name:'Previous featured project',exact:true});
  await next.click();
  await expect(page.locator('[data-featured-view="darcy"]')).toHaveAttribute('aria-selected','true');
  await expect(page.locator('[data-featured-detail]')).toHaveAttribute('src','/media/gallery/darcy/usb-img_2490.webp');
  await previous.click();
  await expect(page.locator('[data-featured-view="crestmont-west"]')).toHaveAttribute('aria-selected','true');
  await previous.click();
  await expect(page.locator('[data-featured-view="seton-crossing"]')).toHaveAttribute('aria-selected','true');
  await next.dispatchEvent('click');await next.dispatchEvent('click');
  await expect(page.locator('[data-featured-view="darcy"]')).toHaveAttribute('aria-selected','true');
  await expect(page.locator('[data-featured-image]')).toHaveAttribute('src','/media/gallery/darcy/usb-img_2484.webp');
  await expect(page.locator('[data-featured-detail]')).toHaveAttribute('src','/media/gallery/darcy/usb-img_2490.webp');
  await page.locator('#motion-choice').selectOption('off');
  await expect(page.locator('.featured-outgoing')).toHaveCount(0);
  expect(await page.locator('#featured').evaluate(section=>section.getAnimations({subtree:true}).length)).toBe(0);
});

test('a missing secondary photograph preserves the complete current view and allows retry',async({page})=>{
  await page.route('**/gallery/darcy/usb-img_2490.webp',route=>route.abort());
  await page.goto('/');
  await page.locator('[data-featured-view="darcy"]').click();
  await expect(page.locator('.featured-status')).toContainText('could not be loaded');
  await expect(page.locator('[data-featured-image]')).toHaveAttribute('src','/media/featured-crestmont.webp');
  await expect(page.locator('[data-featured-detail]')).toHaveAttribute('src','/media/img_2304.webp');
  await expect(page.locator('[data-featured-copy]')).toContainText('A planted courtyard');
  await expect(page.locator('[data-featured-view="crestmont-west"]')).toHaveAttribute('aria-selected','true');
  await page.unroute('**/gallery/darcy/usb-img_2490.webp');
  await page.locator('[data-featured-view="darcy"]').click();
  await expect(page.locator('[data-featured-detail]')).toHaveAttribute('src','/media/gallery/darcy/usb-img_2490.webp');
  await expect(page.locator('[data-featured-image]')).toHaveAttribute('src','/media/gallery/darcy/usb-img_2484.webp');
  await expect(page.locator('.featured-status')).toBeEmpty();
});

test('each featured project updates its identity and all destinations together',async({page})=>{
  await page.goto('/');
  for(const [id,name,location,href] of [
    ['darcy','D’Arcy','Okotoks, Alberta','/darcy'],
    ['seton-crossing','Seton Crossing','Calgary, Alberta','/seton'],
    ['crestmont-west','Crestmont West','Calgary, Alberta','/crestmontwest'],
  ]){
    await page.locator(`[data-featured-view="${id}"]`).click();
    await expect(page.locator('.featured-project-name')).toHaveText(name);
    await expect(page.locator('.featured-location')).toHaveText(location);
    await expect(page.locator('.featured-project-link')).toHaveAttribute('href',href);
    for(const selector of ['.featured-photo','.featured-detail-photo']){
      await expect(page.locator(selector)).toHaveAttribute('href',href+'#gallery');
    }
  }
  await page.locator('[data-featured-view="darcy"]').click();
  await page.locator('.featured-project-link').click();
  await expect(page).toHaveURL(/\/darcy$/);
  await expect(page.locator('h1')).toContainText('D’Arcy');
});
