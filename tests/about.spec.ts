import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('about filters retain correct years and routes, rapid selection settles cleanly',async({page})=>{
 await page.goto('/about');await expect(page.locator('h1')).toContainText('actually built and used');
 await expect(page.locator('.experience-entry')).toHaveCount(18);
 await page.getByRole('button',{name:'Commercial',exact:true}).click();await expect(page.locator('.experience-entry:visible')).toHaveCount(2);await expect(page.locator('.experience-entry:visible').first()).toContainText('2021');
 for(const name of ['Residential','Other','Institutional'])await page.locator(`[data-experience-filter="${name}"]`).click();
 await expect(page.locator('.experience-entry:visible')).toHaveCount(2);
 await page.getByRole('button',{name:'All',exact:true}).click();await expect(page.locator('.experience-entry:visible')).toHaveCount(18);
 await expect(page.locator('.experience-link').filter({hasText:'Seton Crossing'})).toHaveAttribute('href','/seton');
 await expect(page.locator('.experience-entry').filter({hasText:'Colliery Parc'}).locator('a')).toHaveCount(0);
});
test('leadership is open and stages support keyboard and reduced motion',async({page})=>{
 await page.goto('/about');await expect(page.locator('.principal-detail').first()).toContainText('1996');await expect(page.locator('details')).toHaveCount(0);
 await page.locator('#scope-tab-0').focus();await page.keyboard.press('ArrowRight');await expect(page.locator('#scope-tab-1')).toHaveAttribute('aria-selected','true');await expect(page.locator('#scope-panel-1')).toBeVisible();
 await page.emulateMedia({reducedMotion:'reduce'});await page.keyboard.press('End');await expect(page.locator('#scope-panel-2')).toContainText('where included in the project scope');
 await expect(page.locator('.working-principle svg')).toHaveCount(4);
 expect(await page.locator('.about-experience').evaluate(e=>e.nextElementSibling?.classList.contains('about-close'))).toBe(true);
});
test('about is accessible and fits phone, tablet and desktop',async({page})=>{
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});await page.goto('/about');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.locator('.about-close a[href="/contact"]')).toHaveCount(1);}
 await page.emulateMedia({reducedMotion:'reduce'});
 expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
});
test('about content and native disclosures remain available without javascript',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto('http://127.0.0.1:4321/about');await expect(page.locator('.experience-entry:visible')).toHaveCount(18);await expect(page.locator('.principal-detail').first()).toContainText('1996');await expect(page.locator('.scope-panel:visible')).toHaveCount(3);await context.close();
});

test('photographic layout has no placeholders and service imagery follows selection',async({page})=>{
 await page.goto('/about');await expect(page.locator('.about-studio-placeholder,.about-credentials')).toHaveCount(0);
 await expect(page.locator('.principal-portrait img').first()).toHaveAttribute('src','/media/people/peter-imshenetskyy-portrait.webp');await expect(page.locator('.principal-portrait img').last()).toHaveAttribute('src','/media/people/terry-klassen.webp');
 expect(await page.locator('.about-opening-photo').evaluate(e=>Math.abs(e.getBoundingClientRect().width-e.closest('.frame')!.getBoundingClientRect().width)<1)).toBe(true);
 await expect(page.locator('.experience-thumbnail')).toHaveCount(8);
 await page.locator('[data-scope-index="1"]').click();await expect(page.locator('#scope-image')).toHaveAttribute('src','/media/img_2304.webp');await expect(page.locator('#scope-caption')).toContainText('Planting and frontage');
 await page.locator('[data-scope-index="0"]').click();await expect(page.locator('#scope-image')).toHaveAttribute('src','/media/gallery/crestmont-west/landscape-plan-2026.webp');
});

