import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('built-detail selection keeps the real plan, copy and destination together', async ({ page }) => {
  await page.goto('/');
  const paths = page.locator('[data-detail-select="paths"]');
  const materials = page.locator('[data-detail-select="materials"]');
  await expect(paths).toBeEnabled();
  await paths.hover();
  await expect(page.locator('#why')).toHaveAttribute('data-detail-active', 'paths');
  await expect(page.locator('#detail-plan-image')).toHaveAttribute('src', /\/evanston\/3.webp$/);
  await expect(page.locator('[data-detail-project]')).toHaveText('Evanston');
  await expect(page.locator('#detail-project-link')).toHaveAttribute('href', '/evanston');
  await expect(paths).toHaveAttribute('aria-pressed', 'true');
  await materials.focus();
  await expect(page.locator('#why')).toHaveAttribute('data-detail-active', 'materials');
  await expect(page.locator('#detail-plan-image')).toHaveAttribute('src', /\/crestmont-west\/3.webp$/);
  await expect(page.locator('#detail-project-link')).toHaveAttribute('href', '/crestmontwest');
  await expect(page.locator('#detail-plan-copy')).toContainText('natural stone');
});

test('returning to the current detail cancels an unfinished drawing selection', async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/media/gallery/evanston/3.webp', async route => { await pending; await route.continue(); });
  await page.goto('/');
  await page.locator('#why').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('#detail-plan-image').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await page.locator('[data-detail-select="paths"]').focus();
  await expect(page.locator('.detail-plan-link')).toHaveAttribute('aria-busy', 'true');
  await page.locator('[data-detail-select="materials"]').focus();
  release();
  await expect(page.locator('.detail-plan-link')).not.toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('#why')).toHaveAttribute('data-detail-active', 'materials');
  await expect(page.locator('#detail-plan-image')).toHaveAttribute('src', /\/crestmont-west\/3.webp$/);
});

test('drawing failure preserves the current work and supports a successful retry', async ({ page }) => {
  await page.route('**/media/gallery/evanston/3.webp', route => route.abort());
  await page.goto('/');
  await page.locator('[data-detail-select="paths"]').click();
  await expect(page.locator('#detail-plan-status')).toContainText('could not load');
  await expect(page.locator('#why')).toHaveAttribute('data-detail-active', 'materials');
  await expect(page.locator('#detail-project-link')).toHaveAttribute('href', '/crestmontwest');
  await page.unroute('**/media/gallery/evanston/3.webp');
  await page.locator('[data-detail-select="paths"]').click();
  await expect(page.locator('#why')).toHaveAttribute('data-detail-active', 'paths');
  await expect(page.locator('#detail-plan-status')).toBeEmpty();
});

test('drawing viewer has an uncropped image, keyboard controls and focus return', async ({ page }) => {
  await page.goto('/');
  const trigger = page.locator('.detail-desk-links [data-open-drawing]');
  await trigger.click();
  const viewer = page.locator('#detail-drawing-viewer');
  await expect(viewer).toBeVisible();
  await expect(page.locator('#detail-viewer-image')).toBeVisible();
  await expect(page.locator('#detail-viewer-close')).toBeFocused();
  expect(await page.locator('#detail-viewer-image').evaluate(image => getComputedStyle(image).objectFit)).toBe('contain');
  await page.keyboard.press('Tab');
  await expect(page.locator('#detail-viewer-stage')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#detail-viewer-zoom')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(viewer).toHaveAttribute('data-zoom', 'true');
  expect(await page.locator('#detail-viewer-stage').evaluate(stage => stage.scrollWidth > stage.clientWidth)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(viewer).not.toBeVisible();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('');
});

test('mobile drawing selection and viewer remain usable with motion switched off', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.setItem('pi-motion', 'off'));
  await page.goto('/');
  await page.locator('[data-detail-select="paths"]').click();
  await expect(page.locator('#why')).toHaveAttribute('data-detail-active', 'paths');
  await page.locator('.detail-desk-links [data-open-drawing]').click();
  await expect(page.locator('#detail-viewer-title')).toHaveText('Evanston');
  await expect(page.locator('#detail-viewer-image')).toBeVisible();
  expect(await page.locator('#detail-drawing-viewer').evaluate(viewer => viewer.getAnimations({ subtree: true }).length)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const results = await new AxeBuilder({ page }).include('#detail-drawing-viewer').analyze();
  expect(results.violations).toEqual([]);
  await page.locator('#detail-viewer-close').click();
  await expect(page.locator('#detail-drawing-viewer')).not.toBeVisible();
  expect(await page.locator('[data-detail-select="paths"]').evaluate(button => button.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
});
