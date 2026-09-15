import { test, expect } from '@playwright/test';
import { projects, projectPath } from '../src/data/projects';
import { renderingCredit } from '../src/data/image-credit';

test('all added assets exist, galleries preserve image types, and renderings carry credits', async ({ request }) => {
  const assetPaths = new Set<string>();
  expect(projects).toHaveLength(30);
  expect(new Set(projects.map(p => projectPath(p))).size).toBe(projects.length);
  for (const project of projects) {
    const response = await request.get(projectPath(project));
    expect(response.ok()).toBe(true);
    const html = await response.text();
    const gallery = JSON.parse(html.match(/id="project-gallery-data"[^>]*>([\s\S]*?)<\/script>/)![1]);
    expect(gallery.length).toBeGreaterThan(1);
    for (const image of gallery) {
      assetPaths.add(image.src);
      if (image.medium === 'rendering') expect(image.attribution).toBe(renderingCredit(project));
      else expect(image.attribution).toBeUndefined();
    }
  }
  expect([...assetPaths].filter(src => src.includes('/usb-'))).toHaveLength(73);
  const paths = [...assetPaths];
  for(let i=0;i<paths.length;i+=8) await Promise.all(paths.slice(i,i+8).map(async src => {
    expect((await request.head(src)).ok(), src).toBe(true);
  }));
});

for (const width of [1440, 390, 320]) {
  test(`rendering credits and added galleries remain usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/arbourlake');
    await expect(page.locator('.primary-figure .image-medium')).toHaveText('Rendering by project architect');
    await page.locator('.primary-figure .gallery-link').click();
    await expect(page.locator('#viewer-medium')).toHaveText('Rendering by project architect');
    await page.locator('#viewer-next').click();
    await expect(page.locator('#viewer-count')).toHaveText('2 / 5');
    await page.locator('#viewer-next').click();
    await expect(page.locator('#viewer-count')).toHaveText('3 / 5');
    await expect(page.locator('#viewer-medium')).toBeEmpty();
    await expect(page.locator('#viewer-close')).toBeInViewport();
    await page.keyboard.press('Escape');
    for (const id of ['homestead-townhomes', 'pickel-residence', 'ryan-residence']) {
      await page.goto('/' + id);
      await expect(page.locator('h1')).toHaveText(projects.find(p => p.id === id)!.name);
      await expect.poll(() => page.locator('.primary-figure img').evaluate((im:HTMLImageElement) => im.complete && im.naturalWidth > 0)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    for (const element of await page.locator('[data-reveal]').all()) { await element.scrollIntoViewIfNeeded(); await page.waitForTimeout(650); }
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(850);
    await page.screenshot({ path: `design/review/usb/ryan-${width}.png`, fullPage: true });
    await page.goto('/crimsonridgezen');
    await expect(page.locator('.primary-figure .image-medium')).toHaveText('Rendering by Davignon Martin');
    await page.locator('.primary-figure .gallery-link').click();
    await expect(page.locator('#viewer-medium')).toHaveText('Rendering by Davignon Martin');
    await page.waitForTimeout(850);
    const box = await page.locator('#viewer-medium').boundingBox();
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    await page.screenshot({ path: `design/review/usb/credit-${width}.png` });
  });
}

test('archive and search expose all projects and matching rendering credits', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.project-entry')).toHaveCount(30);
  await expect(page.locator('[data-project="lawrie-park"] .project-medium')).toHaveText('Rendering by Systemic');
  await page.locator('[data-project-search]').first().click();
  await page.locator('#site-search-input').fill('Lawrie');
  await expect(page.locator('[data-search-project="lawrie-park"]')).toBeVisible();
  await expect(page.locator('[data-search-project="lawrie-park"]')).toContainText('Rendering by Systemic');
  await page.locator('#site-search-input').fill('Homestead');
  await expect(page.locator('[data-search-project="homestead-townhomes"]')).toBeVisible();
  await page.locator('[data-search-project="homestead-townhomes"]').click();
  await expect(page.locator('h1')).toHaveText('Homestead Townhomes');
});

