import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#site-search-dialog')).toHaveAttribute('data-ready', 'true');
});

test('search opens a photographic dialog without moving the page or header', async ({ page }) => {
  const header = page.locator('.site-header__inner');
  const before = await header.boundingBox();
  const href = page.url();
  await page.locator('.header-search').click();
  await expect(page.locator('#site-search-input')).toBeFocused();
  await expect(page).toHaveURL(href);
  await expect(page.locator('[data-search-project]:visible')).toHaveCount(3);
  await expect.poll(() => page.locator('[data-search-project]:visible img').evaluateAll(images => images.every(image => (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
  const during = await header.boundingBox();
  expect(during!.x).toBeCloseTo(before!.x, 1); expect(during!.width).toBeCloseTo(before!.width, 1);
  const accessibility = await new AxeBuilder({ page }).include('#site-search-dialog').analyze();
  expect(accessibility.violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.locator('#site-search-dialog')).not.toBeVisible();
  await expect(page.locator('.header-search')).toBeFocused();
  expect((await header.boundingBox())!.width).toBeCloseTo(before!.width, 1);
});

test('search matches names with accents and apostrophes, as well as type and place', async ({ page }) => {
  await page.locator('.header-search').click();
  const input = page.locator('#site-search-input'), results = page.locator('[data-search-project]:visible');
  for (const query of ["D'Arcy", 'D’Arcy', 'darcy']) {
    await input.fill(query); await expect(results).toHaveCount(2);
    await expect(page.locator('[data-search-project="darcy"]')).toBeVisible();
  }
  await input.fill('Évanston'); await expect(results).toHaveCount(1);
  await expect(results).toHaveAttribute('data-search-project', 'evanston');
  await input.fill('Okotoks'); await expect(results).toHaveCount(1);
  await expect(results).toHaveAttribute('data-search-project', 'darcy');
  await input.fill('Commercial');
  expect(await results.count()).toBeGreaterThan(1);
  expect(await results.locator('.site-search-result-context').evaluateAll(elements => elements.every(element => element.textContent?.includes('Commercial')))).toBe(true);
  await page.locator('#site-search-all').click(); await expect(results).toHaveCount(27);
  expect(await results.evaluateAll(links => new Set(links.map(link => (link as HTMLAnchorElement).href)).size)).toBe(27);
});

test('the first Escape closes search while a nonempty search field is focused', async ({ page }) => {
  await page.locator('.header-search').click();
  const input = page.locator('#site-search-input');
  await input.fill('D’Arcy');
  await expect(input).toBeFocused();
  await expect(page.locator('[data-search-project]:visible')).toHaveCount(2);
  await input.press('Escape');
  await expect(page.locator('#site-search-dialog')).not.toBeVisible();
  await expect(input).toHaveValue('D’Arcy');
  await expect(page.locator('.header-search')).toBeFocused();
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
});

test('empty search results explain the state and recover to the complete project list', async ({ page }) => {
  await page.locator('.header-search').click();
  const before = await page.locator('#site-search-dialog').boundingBox();
  await page.locator('#site-search-input').fill('not a real project zzz');
  await expect(page.locator('#site-search-empty')).toBeVisible();
  await expect(page.locator('[data-search-project]:visible')).toHaveCount(0);
  await expect(page.locator('#site-search-announcement')).toContainText('0 projects found');
  expect((await page.locator('#site-search-dialog').boundingBox())!.height).toBeCloseTo(before!.height, 1);
  await page.locator('#site-search-reset').click();
  await expect(page.locator('[data-search-project]:visible')).toHaveCount(27);
  await page.locator('#site-search-input').fill('Crestmont');
  await page.locator('#site-search-clear').click();
  await expect(page.locator('#site-search-input')).toHaveValue('');
  await expect(page.locator('[data-search-project]:visible')).toHaveCount(3);
});

test('rapid result changes settle on the latest query and respect motion off', async ({ page }) => {
  await page.locator('.header-search').click();
  const input = page.locator('#site-search-input');
  await input.fill('Seton');
  await input.fill('No project zzz');
  await input.fill('Evanston');
  const results = page.locator('[data-search-project]:visible');
  await expect(results).toHaveCount(1);
  await expect(results).toHaveAttribute('data-search-project', 'evanston');
  await expect(page.locator('#site-search-empty')).not.toBeVisible();
  await expect.poll(() => page.locator('#site-search-results').evaluate(element => element.getAnimations().filter(animation => animation.playState === 'running').length)).toBe(0);
  await expect(page.locator('#site-search-results')).toHaveCSS('opacity', '1');
  await input.fill('Seton');
  await page.evaluate(() => {
    document.documentElement.dataset.motion = 'off';
    document.dispatchEvent(new CustomEvent('pi:motion'));
  });
  await expect.poll(() => page.locator('#site-search-dialog').evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length)).toBe(0);
  await expect(page.locator('#site-search-results')).toHaveCSS('opacity', '1');
  await input.fill('Crestmont');
  await expect(results).toHaveCount(1);
  await expect(results).toHaveAttribute('data-search-project', 'crestmont-west');
  expect(await page.locator('#site-search-results').evaluate(element => element.getAnimations().length)).toBe(0);
});

test('refining the same matches receives a visible fade and keyboard focus settles it', async ({ page }) => {
  await page.locator('.header-search').click();
  const input = page.locator('#site-search-input'), list = page.locator('#site-search-results');
  await input.fill('D’Arc');
  await expect(page.locator('[data-search-project]:visible')).toHaveCount(2);
  await expect.poll(() => list.evaluate(element => element.getAnimations().filter(animation => animation.playState === 'running').length)).toBe(0);
  await input.fill('D’Arcy');
  const starting = await list.evaluate(element => ({ opacity: Number(getComputedStyle(element).opacity), duration: element.getAnimations()[0]?.effect?.getTiming().duration }));
  expect(starting.opacity).toBeLessThan(.65);
  expect(starting.duration).toBe(460);
  await page.waitForTimeout(140);
  const middle = await list.evaluate(element => Number(getComputedStyle(element).opacity));
  expect(middle).toBeGreaterThan(starting.opacity);
  expect(middle).toBeLessThan(1);
  await input.press('ArrowDown');
  await expect(page.locator('[data-search-project="darcy"]')).toBeFocused();
  await expect(list).toHaveCSS('opacity', '1');
});

test('arrow keys, Enter and the dialog focus loop work together', async ({ page }) => {
  await page.keyboard.press('Control+k');
  const input = page.locator('#site-search-input');
  await expect(input).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('[data-search-project="crestmont-west"]')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('[data-search-project="darcy"]')).toBeFocused();
  await page.keyboard.press('Home'); await page.keyboard.press('ArrowUp');
  await expect(input).toBeFocused();
  await page.locator('#site-search-all').focus(); await page.keyboard.press('Tab');
  await expect(page.locator('#site-search-close')).toBeFocused();
  await page.keyboard.press('Shift+Tab'); await expect(page.locator('#site-search-all')).toBeFocused();
  await input.fill('Evanston'); await input.press('Enter');
  await expect(page).toHaveURL(/\/evanston$/);
  await expect(page.locator('h1')).toHaveText('Evanston');
});

test('search replaces the mobile navigation and restores a visible menu control', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.locator('.mobile-menu-button').click();
  await page.locator('#mobile-navigation [data-project-search]').click();
  await expect(page.locator('#mobile-navigation')).not.toBeVisible();
  await expect(page.locator('#site-search-dialog')).toBeVisible();
  await expect(page.locator('#site-search-input')).toBeFocused();
  expect(await page.locator('#site-search-dialog').evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.locator('#site-search-input').fill('Seton');
  await expect(page.locator('[data-search-project="seton-crossing"]')).toBeVisible();
  await page.locator('#site-search-close').click();
  await expect(page.locator('.mobile-menu-button')).toBeFocused();
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
});

test('motion off resolves interrupted search opening and closing without stuck modal state', async ({ page }) => {
  await page.locator('.header-search').click();
  await page.evaluate(() => {
    document.documentElement.dataset.motion = 'off';
    document.dispatchEvent(new CustomEvent('pi:motion'));
  });
  await expect.poll(() => page.locator('#site-search-dialog').evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length)).toBe(0);
  await page.locator('#site-search-input').fill('Crestmont');
  await page.locator('#site-search-close').click();
  await expect(page.locator('#site-search-dialog')).not.toBeVisible();
  await page.locator('.header-search').click();
  await expect(page.locator('#site-search-input')).toBeFocused();
  await expect(page.locator('[data-search-project]:visible')).toHaveCount(3);
  await page.mouse.click(8, 8); await expect(page.locator('#site-search-dialog')).not.toBeVisible();
});

test('without JavaScript the search link still opens the full homepage archive', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/crestmontwest');
  await page.locator('.header-search').click();
  await expect(page).toHaveURL(/\/#projects$/);
  await expect(page.locator('.project-entry')).toHaveCount(27);
  await expect(page.locator('#site-search-dialog')).not.toBeVisible();
  await context.close();
});
