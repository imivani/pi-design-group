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
test('leadership and responsibilities expand with keyboard and reduced motion',async({page})=>{
 await page.goto('/about');const details=page.locator('.principal .practice-disclosure').first();await details.locator('summary').focus();await page.keyboard.press('Enter');await expect(details).toHaveAttribute('open','');await expect(details).toContainText('1996');
 await page.keyboard.press('Enter');await expect(details).not.toHaveAttribute('open');
 await page.emulateMedia({reducedMotion:'reduce'});await details.locator('summary').click();await expect(details).toHaveAttribute('open','');
 await page.locator('.scope-item').last().locator('summary').click();await expect(page.locator('.scope-item').last()).toContainText('where included in the project scope');
 await expect(page.locator('.principal-portrait img')).toHaveCount(2);
});
test('about is accessible and fits phone, tablet and desktop',async({page})=>{
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});await page.goto('/about');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.locator('.about-close a[href="/contact"]')).toHaveCount(1);}
 await page.emulateMedia({reducedMotion:'reduce'});
 expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
});
test('about content and native disclosures remain available without javascript',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto('http://127.0.0.1:4321/about');await expect(page.locator('.experience-entry:visible')).toHaveCount(18);await page.locator('.principal summary').first().click();await expect(page.locator('.principal details').first()).toHaveAttribute('open','');await context.close();
});

test('photographic layout has no placeholders and service imagery follows selection',async({page})=>{
 await page.goto('/about');await expect(page.locator('.about-studio-placeholder,.about-credentials')).toHaveCount(0);
 await expect(page.locator('.principal-portrait img').first()).toHaveAttribute('src','/media/people/peter-imshenetskyy.webp');await expect(page.locator('.principal-portrait img').last()).toHaveAttribute('src','/media/people/terry-klassen.webp');
 expect(await page.locator('.about-opening-photo').evaluate(e=>Math.abs(e.getBoundingClientRect().width-e.closest('.frame')!.getBoundingClientRect().width)<1)).toBe(true);
 await expect(page.locator('.experience-thumbnail')).toHaveCount(8);
 await page.locator('[data-scope-index="2"] summary').hover();await expect(page.locator('#scope-image')).toHaveAttribute('src','/media/img_2304.webp');await expect(page.locator('#scope-caption')).toContainText('Planting detail');
 await page.locator('[data-scope-index="0"] summary').focus();await expect(page.locator('#scope-image')).toHaveAttribute('src','/media/gallery/crestmont-west/3.webp');
});
