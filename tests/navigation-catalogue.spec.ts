import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#site-header')).toHaveAttribute('data-ready', 'true');
});

test('all 27 projects are available on hover, with decoded previews and direct destinations', async ({ page }) => {
  await page.locator('[data-menu-trigger="projects"]').hover();
  await page.locator('button[data-catalogue-open]').hover();
  const catalogue = page.locator('#project-menu-catalogue');
  await expect(catalogue).toHaveAttribute('aria-hidden', 'false');
  await expect(catalogue.locator('[data-catalogue-project]')).toHaveCount(27);
  expect(await catalogue.locator('[data-catalogue-project]').evaluateAll((links) => new Set(links.map((link) => (link as HTMLAnchorElement).pathname)).size)).toBe(27);
  await catalogue.locator('[data-catalogue-project="arbour-lake"]').hover();
  await catalogue.locator('[data-catalogue-project="rona"]').hover();
  await expect(catalogue.locator('[data-catalogue-preview-name]')).toHaveText('Rona Replacement Warehouse');
  await expect(catalogue.locator('[data-catalogue-preview-kind]')).toHaveText('Drawing');
  await expect(catalogue.locator('[data-catalogue-preview-image]')).toHaveCSS('object-fit', 'contain');
  await catalogue.locator('[data-catalogue-project="darcy"]').focus();
  await expect(catalogue.locator('[data-catalogue-preview-name]')).toHaveText('D’Arcy');
  await expect(catalogue.locator('[data-catalogue-preview-place]')).toHaveText('Okotoks, Alberta');
  await expect(catalogue.locator('[data-catalogue-preview-link]')).toHaveAttribute('href', /\/darcy$/);
  await expect(catalogue.locator('[data-catalogue-preview-kind]')).toBeHidden();
  await expect(catalogue.locator('[data-preview-outgoing]')).toHaveCount(0);
  const accessibility = await new AxeBuilder({ page }).include('#desktop-navigation').analyze();
  expect(accessibility.violations).toEqual([]);
  await catalogue.locator('[data-catalogue-project="darcy"]').click();
  await expect(page).toHaveURL(/\/darcy$/);
  await expect(page.locator('h1')).toHaveText('D’Arcy');
});

test('catalogue focus follows its visible reading order and Escape returns through the hierarchy', async ({ page }) => {
  const projects = page.locator('[data-menu-trigger="projects"]');
  const trigger = page.locator('button[data-catalogue-open]');
  await projects.focus();
  await page.keyboard.press('ArrowDown');
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-catalogue-back]')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('.catalogue-heading>a')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-catalogue-project]').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(page.locator('#project-menu-catalogue')).toHaveAttribute('inert', '');
  await page.keyboard.press('Escape');
  await expect(projects).toBeFocused();
  await expect(page.locator('#desktop-navigation')).toHaveAttribute('inert', '');
});

test('mobile visitors can browse and open the same complete catalogue', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.locator('.mobile-menu-button').click();
  await page.locator('[data-mobile-disclosure="mobile-project-links"]').click();
  await page.locator('[data-mobile-disclosure="mobile-project-catalogue"]').click();
  const links = page.locator('.mobile-catalogue-links>a');
  await expect(links).toHaveCount(27);
  await expect(page.locator('#mobile-project-catalogue')).not.toHaveAttribute('inert', '');
  expect(await page.locator('#mobile-navigation').evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await links.last().scrollIntoViewIfNeeded();
  const box = await links.last().boundingBox();
  expect(box!.x + box!.width).toBeLessThanOrEqual(320);
  await links.last().click();
  await expect(page).toHaveURL(/\/zenmahogany$/);
  await expect(page.locator('h1')).toHaveText('Zen Mahogany');
});

test('catalogue fits compact desktop and resolves active motion when motion is switched off', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 640 });
  await page.locator('[data-menu-trigger="projects"]').click();
  await page.locator('button[data-catalogue-open]').click();
  const surface = page.locator('#desktop-navigation');
  const bounds = await surface.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(1100);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(640);
  await page.locator('[data-catalogue-project="evanston"]').focus();
  await page.evaluate(() => { document.documentElement.dataset.motion = 'off'; });
  await expect(page.locator('[data-catalogue-preview-name]')).toHaveText('Evanston');
  await expect(page.locator('[data-preview-outgoing]')).toHaveCount(0);
  await expect.poll(() => surface.evaluate((element) => element.getAnimations({ subtree: true }).filter((animation) => animation.playState === 'running').length)).toBe(0);
  await page.keyboard.press('Escape');
  await page.locator('[data-menu-trigger="services"]').click();
  await expect(page.locator('.service-menu-link__name')).toHaveText(['Multifamily Communities', 'Commercial Plazas', 'Public Parks']);
});
