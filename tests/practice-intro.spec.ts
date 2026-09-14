import {test,expect} from '@playwright/test';

test('practice introduction comes before the three areas of expertise and stays readable on phones',async({page})=>{
  for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:900});
    await page.goto('/');
    await page.locator('#about').scrollIntoViewIfNeeded();
    await expect(page.locator('#practice-title')).toHaveText('A Calgary-BasedLandscape Practice.');
    await expect(page.locator('#services-title')).toHaveText('Our Expertise in Three Areas.');
    expect(await page.evaluate(()=>{
      const about=document.querySelector('#about')!,services=document.querySelector('#services')!;
      return !!(about.compareDocumentPosition(services)&Node.DOCUMENT_POSITION_FOLLOWING);
    })).toBe(true);
    const frame=await page.locator('#about').boundingBox();
    for(const element of await page.locator('#about h2,#about p').all()){
      const box=await element.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(frame!.x);
      expect(box!.x+box!.width).toBeLessThanOrEqual(frame!.x+frame!.width+1);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
});
