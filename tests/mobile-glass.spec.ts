import {test,expect} from '@playwright/test';
test('mobile glass menu closes safely during entry and motion preference changes',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 const menu=page.locator('#mobile-navigation');const trigger=page.locator('.mobile-menu-button');
 await trigger.click();await expect(menu).toBeVisible();
 expect(await menu.evaluate(e=>getComputedStyle(e).backdropFilter)).toContain('blur(32px)');
 await page.locator('[data-mobile-close]').click();
 await page.evaluate(()=>document.documentElement.dataset.motion='off');
 await expect(menu).not.toBeVisible();await expect(trigger).toBeFocused();
 expect(await page.evaluate(()=>document.documentElement.style.overflow)).toBe('');
 await trigger.click();await page.locator('[data-mobile-disclosure="mobile-project-links"]').click();
 const link=page.locator('.mobile-project-shortcuts a').first();await expect(link).toBeVisible();
 expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(76);
 await link.click();await expect(page).toHaveURL(/\/darcy$/);
});
test('featured background follows the chosen project and settles without duplicate layers',async({page})=>{
 await page.goto('/');await page.locator('#featured').scrollIntoViewIfNeeded();
 await page.locator('[data-featured-view="darcy"]').click();
 await expect(page.locator('#featured-perspective')).toHaveAttribute('data-featured-project','darcy');
 await expect(page.locator('[data-featured-background]')).toHaveAttribute('src',await page.locator('[data-featured-image]').getAttribute('src')||'');
 await expect(page.locator('.featured-outgoing')).toHaveCount(0);
 expect(await page.locator('#featured').evaluate(e=>Math.abs(e.getBoundingClientRect().width-document.body.clientWidth)<1)).toBe(true);
});

