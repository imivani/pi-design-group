import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { projects, projectPath } from '../src/data/projects';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-enhanced', 'true');
});

test('complete catalogue and correct project destinations are rendered before filtering', async ({ page, request }) => {
  await expect(page.locator('.project-entry')).toHaveCount(27);
  expect(new Set(projects.map(project => project.url)).size).toBe(27);
  for (const project of projects) {
    await expect(page.locator('[data-project="' + project.id + '"] a')).toHaveAttribute('href', projectPath(project));
    expect((await request.get(projectPath(project))).ok(),project.name+' page').toBeTruthy();
    const response = await request.get(project.image);
    expect(response.ok(), project.image).toBeTruthy();
    expect(response.headers()['content-type']).toContain('image/webp');
  }
  await expect(page.locator('.project-link').filter({ hasText: 'Summit 77 Apartments' })).toHaveAttribute('href', '/summit77apartments');
  await expect(page.locator('a[href="mailto:peter@pidesigngroup.ca"]')).toHaveCount(3);
});

test('filters, search, no results, reset and grid/index preserve the chosen state', async ({ page }) => {
  await page.locator('[data-filter="commercial"]').click();
  await expect(page.locator('.project-entry:visible')).toHaveCount(3);
  await page.locator('#project-search').fill('seton');
  await expect(page.locator('.project-entry:visible')).toHaveCount(2);
  await page.locator('button[data-view="index"]').click();
  await expect(page.locator('#project-collection')).toHaveAttribute('data-view', 'index');
  await expect(page.locator('#project-search')).toHaveValue('seton');
  await page.reload();
  await expect(page.locator('.project-entry:visible')).toHaveCount(2);
  await expect(page.locator('#project-collection')).toHaveAttribute('data-view', 'index');
  await page.locator('#project-search').fill('does-not-exist');
  await expect(page.locator('#project-empty')).toBeVisible();
  await expect(page.locator('#project-count')).toHaveText('0 of 27 entries');
  await page.locator('#reset-projects').click();
  await expect(page.locator('.project-entry:visible')).toHaveCount(27);
  await expect(page.locator('#project-search')).toBeFocused();
  await expect(page.locator('#project-collection')).toHaveAttribute('data-view', 'index');
});

test('project search tolerates apostrophe styles and browser back restores catalogue state', async ({ page }) => {
  await page.locator('#project-search').fill("D'Arcy");
  await expect(page.locator('.project-entry:visible')).toHaveCount(2);
  await page.locator('button[data-view="index"]').click();
  await page.locator('footer a[href="#contact"]').click();
  await page.goBack();
  await expect(page.locator('#project-search')).toHaveValue("D'Arcy");
  await expect(page.locator('.project-entry:visible')).toHaveCount(2);
  await expect(page.locator('#project-collection')).toHaveAttribute('data-view', 'index');
});

test('three service photos remain visible, newest expansion wins and keyboard works', async ({ page }) => {
  await page.locator('#services').scrollIntoViewIfNeeded();
  await page.locator('#tab-commercial').click();
  await expect(page.locator('#service-commercial')).toBeVisible();
  await expect(page.locator('#service-multifamily')).toBeHidden();
  await expect(page.locator('#service-commercial')).toContainText('shops');
  for (const id of ['parks', 'multifamily', 'commercial', 'parks']) {
    await page.locator('#tab-' + id).dispatchEvent('click');
    await page.waitForTimeout(60);
  }
  await expect(page.locator('#service-parks')).toBeVisible();
  await expect(page.locator('.service-panel:visible')).toHaveCount(3);
  await expect.poll(() => page.locator('[data-service-panel="parks"] img').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('#tab-parks')).toHaveAttribute('aria-expanded','true');
  await expect.poll(async()=>{const widths=await page.locator('.service-panel').evaluateAll(els=>els.map(el=>el.getBoundingClientRect().width));return widths[2]/widths[0];}).toBeCloseTo(2.2,1);
  await page.locator('#tab-parks').focus();
  await page.keyboard.press('Home');
  await expect(page.locator('#tab-multifamily')).toBeFocused();
  await expect(page.locator('.service-panel:visible')).toHaveCount(3);
  await expect(page.locator('#tab-multifamily')).toHaveAttribute('aria-expanded','true');
});

test('service image failure preserves readable content and other photographs', async ({ page }) => {
  await page.route('**/service-commercial.webp', route => route.abort());
  await page.reload();
  await page.locator('#services').scrollIntoViewIfNeeded();
  await page.locator('#tab-commercial').click();
  await expect(page.locator('#service-commercial')).toContainText('Photograph unavailable');
  await expect(page.locator('#service-commercial')).toContainText('shops');
  await expect(page.locator('[data-service-panel="multifamily"] img')).toBeVisible();
});

test('video autoplay reflects actual state, manual pause survives leaving and returning', async ({ page }) => {
  await page.evaluate(() => sessionStorage.removeItem('pi-video-paused'));
  await page.reload();
  await expect.poll(() => page.locator('#hero-video').evaluate((video: HTMLVideoElement) => !video.paused)).toBe(true);
  await expect(page.locator('#video-toggle')).toHaveAttribute('aria-label', 'Pause background video');
  await page.locator('#video-toggle').click();
  await expect(page.locator('#hero-video')).toHaveJSProperty('paused', true);
  await page.locator('#projects').scrollIntoViewIfNeeded();
  await page.locator('#hero').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await expect(page.locator('#hero-video')).toHaveJSProperty('paused', true);
  await page.locator('#video-toggle').click();
  await expect(page.locator('#hero-video')).toHaveJSProperty('paused', false);
  await page.locator('#why').scrollIntoViewIfNeeded();
  await expect(page.locator('#hero-video')).toHaveJSProperty('paused', true);
});

test('reduced motion stops video live; off settles animations and still permits controls', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await expect(page.locator('#hero-video')).toHaveJSProperty('paused', true);
  await page.locator('#motion-choice').selectOption('off');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'off');
  await page.locator('#tab-parks').click();
  await expect(page.locator('#service-parks')).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length)).toBe(0);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'off');
  await expect(page.locator('#hero-video')).toHaveJSProperty('paused', true);
});

test('blocked media keeps a readable poster and useful play control', async ({ page }) => {
  await page.route('**/hero.mp4', route => route.abort());
  await page.reload();
  await expect(page.locator('.hero-poster')).toBeVisible();
  await expect(page.locator('#video-status')).toContainText('unavailable');
  await expect(page.locator('#video-toggle')).toHaveAttribute('aria-label', 'Play background video');
  await expect(page.locator('[data-poster-caption]')).toBeVisible();
});

test('blocked browser storage cannot prevent the page controls from starting', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get: () => { throw new Error('Storage disabled'); } });
    Object.defineProperty(window, 'sessionStorage', { get: () => { throw new Error('Storage disabled'); } });
  });
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-enhanced', 'true');
  await page.locator('[data-filter="single-homes"]').click();
  await expect(page.locator('.project-entry:visible')).toHaveCount(2);
});

test('all images render and page has no serious accessibility violations', async ({ page }) => {
  await page.evaluate(async () => {
    const imgs = [...document.images].filter(img => img.getAttribute('src'));
    imgs.forEach(img => img.loading = 'eager');
    await Promise.all(imgs.map(img => img.decode().catch(() => {})));
  });
  expect(await page.evaluate(() => [...document.images].filter(img => img.getAttribute('src') && (!img.complete || !img.naturalWidth)).map(img => img.src))).toEqual([]);
  const result = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(result.violations.map(item => ({ id: item.id, impact: item.impact, nodes:item.nodes.map(node => node.target) }))).toEqual([]);
});

for (const width of [320,390,768,1024,1440,1920]) {
  test('layout fits at ' + width + 'px', async ({ page }) => {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    await page.reload();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const columns = await page.locator('#project-collection').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(width < 640 ? 1 : width < 1024 ? 2 : 3);
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await expect(page.locator('#contact a[href^="mailto:"]').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('without JavaScript, hero content and all project links remain usable', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled:false, viewport:{width:1440,height:1000} });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.project-entry')).toHaveCount(27);
  await expect(page.locator('.project-controls')).toBeHidden();
  await expect(page.locator('#contact a[href^="mailto:"]').first()).toBeVisible();
  await context.close();
});
