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

test('three built details support keyboard selection with truthful drawing context', async ({ page }) => {
  await page.goto('/');
  const planting = page.locator('[data-detail-select="planting"]');
  await planting.focus();
  await expect(page.locator('#why')).toHaveAttribute('data-detail-active', 'planting');
  await expect(planting.locator('img')).toHaveAttribute('src', /\/crestmont-west\/8.webp$/);
  await expect(page.locator('#detail-plan-image')).toHaveAttribute('src', /\/crestmont-west\/3.webp$/);
  await expect(page.locator('#detail-plan-title')).toHaveText('Planting Layout');
  await expect(page.locator('#detail-plan-counter')).toHaveAttribute('aria-label', 'Detail 1 of 3');
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('[data-detail-select="paths"]')).toBeFocused();
  await expect(page.locator('#why')).toHaveAttribute('data-detail-active', 'paths');
  await expect(page.locator('#detail-project-link')).toHaveAttribute('href', '/evanston');
  await page.keyboard.press('End');
  await expect(page.locator('[data-detail-select="materials"]')).toBeFocused();
  await expect(page.locator('#detail-plan-title')).toHaveText('Materials & Edges');
  await expect(page.locator('#detail-plan-counter')).toHaveAttribute('aria-label', 'Detail 3 of 3');
  await page.keyboard.press('Home');
  await expect(planting).toBeFocused();
  await expect(page.locator('#why')).toHaveAttribute('data-detail-active', 'planting');
  await page.locator('.detail-desk-links [data-open-drawing]').click();
  await expect(page.locator('#detail-viewer-caption')).toContainText('flowering plants');
  await expect(page.locator('#detail-viewer-title')).toHaveText('Crestmont West');
});

test('details remain readable at narrow widths and keep all three choices available', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('pi-motion', 'off'));
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    const choices = page.locator('[data-detail-select]');
    await expect(choices).toHaveCount(3);
    for (const choice of await choices.all()) {
      await choice.click();
      await expect(choice).toHaveAttribute('aria-pressed', 'true');
      expect(await choice.evaluate(element => {
        const row = element.getBoundingClientRect();
        const title = element.querySelector('.detail-choice-title')!.getBoundingClientRect();
        const summary = element.querySelector('.detail-choice-summary')!.getBoundingClientRect();
        const footer = element.querySelector('.detail-choice-footer')!.getBoundingClientRect();
        return row.width >= 44 && row.height >= 44 && title.left >= row.left && title.right <= row.right + 1 && summary.bottom <= footer.top + 1;
      })).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.locator('#detail-plan-image').evaluate(image => getComputedStyle(image).objectFit)).toBe('contain');
  }
  const results = await new AxeBuilder({ page }).include('#why').analyze();
  expect(results.violations).toEqual([]);
});

test('hover opens the photograph aperture while reduced motion keeps it still', async ({ page }) => {
  await page.goto('/');
  const row = page.locator('[data-detail-select="planting"]');
  await row.scrollIntoViewIfNeeded();
  const photo = row.locator('.detail-choice-image');
  const initialWidth = (await photo.boundingBox())!.width;
  await row.hover();
  await expect(page.locator('#why')).toHaveAttribute('data-detail-active', 'planting');
  await expect.poll(async () => (await photo.boundingBox())!.width).toBeGreaterThan(initialWidth + 10);
  await page.locator('#motion-choice').selectOption('reduced');
  await row.hover();
  expect(await row.evaluate(element => element.getAnimations({ subtree: true }).length)).toBe(0);
  expect(await row.locator('img').evaluate(image => getComputedStyle(image).transform)).toBe('none');
  await page.locator('[data-detail-select="materials"]').click();
  await expect(page.locator('#detail-plan-title')).toHaveText('Materials & Edges');
});
