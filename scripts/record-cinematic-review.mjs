import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const output = 'design/review';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = { errors: [], failedImages: [], archive: [], contact: [], accessibility: [] };
const captureStyle = '.site-header,.skip-link{visibility:hidden!important}';

for (const width of [1440, 390, 320]) {
  const context = await browser.newContext({
    viewport: { width, height: 1000 }, deviceScaleFactor: 1,
    ...(width < 768 ? { isMobile: true, hasTouch: true } : {}),
    ...(width === 1440 ? { recordVideo: { dir: `${output}/cinematic-recording`, size: { width, height: 1000 } } } : {}),
  });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push({ width, error: error.message }));
  const moveTo = async selector => {
    await page.locator(selector).evaluate(element => scrollTo({ top: element.getBoundingClientRect().top + scrollY - 84, behavior: 'smooth' }));
    await page.waitForTimeout(850);
  };
  await page.goto('http://127.0.0.1:4321/');
  if (width === 1440) {
    await page.waitForTimeout(800);
    await moveTo('#about');
    await moveTo('#services');
    for (const service of ['commercial', 'parks']) {
      await page.locator(`[data-service="${service}"]`).hover();
      await page.waitForTimeout(700);
    }
    await moveTo('#featured');
    for (const view of ['play', 'planting', 'courtyard']) {
      await page.locator(`[data-featured-view="${view}"]`).hover();
      await page.waitForTimeout(850);
    }
    await moveTo('#why');
    await page.locator('[data-detail-select="paths"]').hover();
    await page.waitForTimeout(750);
  }

  await moveTo('#projects');
  const first = page.locator('.project-entry:visible').first();
  await expect(first.locator('img')).toBeVisible();
  await first.locator('img').evaluate(image => image.decode());
  const geometry = () => first.evaluate(entry => {
    const card = entry.querySelector('.project-link').getBoundingClientRect();
    const image = entry.querySelector('img').getBoundingClientRect();
    return { cardHeight: card.height, cardWidth: card.width, imageHeight: image.height, coversBottom: image.bottom >= card.bottom - 1 };
  });
  const before = await geometry();
  if (width === 1440) {
    await first.locator('a').hover();
    await expect(first.locator('a')).toHaveAttribute('data-details-open', 'true');
    await page.waitForTimeout(950);
  }
  const after = await geometry();
  expect(after.cardHeight).toBeCloseTo(before.cardHeight, 1);
  expect(after.cardWidth).toBeCloseTo(before.cardWidth, 1);
  if (width === 1440) expect(after.coversBottom).toBe(true);
  await first.screenshot({ path: `${output}/cinematic-archive-card-${width}.png` });
  await page.screenshot({ path: `${output}/cinematic-archive-${width}.png` });
  await page.locator('[data-filter="commercial"]').click();
  for (const category of ['multifamily', 'single-homes', 'commercial']) {
    await page.locator(`[data-filter="${category}"]`).dispatchEvent('click');
    await page.waitForTimeout(60);
  }
  await expect(page.locator('#project-collection')).toHaveAttribute('data-filter-transition', 'done');
  await expect(page.locator('.project-entry:visible')).toHaveCount(3);
  await page.locator('[data-filter="all"]').click();
  await page.locator('#project-search').fill('Unknown project');
  await page.locator('#project-search').fill('Crestmont');
  await expect(page.locator('#project-collection')).toHaveAttribute('data-filter-transition', 'done');
  await expect(page.locator('.project-entry:visible')).toHaveCount(1);
  for (const view of ['index', 'grid']) {
    await page.locator(`button[data-view="${view}"]`).click();
    await expect(page.locator('#project-collection')).toHaveAttribute('data-filter-transition', 'done');
  }
  await page.locator('#project-search').fill('');
  await expect(page.locator('.project-entry:visible')).toHaveCount(27);
  await expect(page.locator('#project-collection')).toHaveAttribute('data-filter-transition', 'done');
  report.archive.push({ width, before, after, latestFilters: true, latestSearch: true, views: true, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) });

  await moveTo('#contact');
  const panel = page.locator('.contact-panel');
  await expect(panel).toHaveAttribute('data-camera-motion', 'moving');
  const motion = await panel.locator('img').evaluate(image => ({ transform: getComputedStyle(image).transform, duration: image.getAnimations()[0].effect.getTiming().duration }));
  const text = await panel.locator('.contact-panel-content').boundingBox();
  await page.waitForTimeout(1700);
  const nextTransform = await panel.locator('img').evaluate(image => getComputedStyle(image).transform);
  expect(nextTransform).not.toBe(motion.transform);
  expect(await panel.locator('.contact-panel-content').boundingBox()).toEqual(text);
  await panel.screenshot({ path: `${output}/cinematic-contact-${width}.png`, style: captureStyle });
  const audit = await new AxeBuilder({ page }).include('#contact').analyze();
  report.accessibility.push({ width, section: 'contact', violations: audit.violations.map(({ id, impact }) => ({ id, impact })) });
  await moveTo('#hero');
  await expect(panel).toHaveAttribute('data-camera-motion', 'paused');
  await moveTo('#contact');
  await expect(panel).toHaveAttribute('data-camera-motion', 'moving');
  await page.locator('#motion-choice').selectOption('off');
  await expect(panel).toHaveAttribute('data-camera-motion', 'still');
  await expect(panel.locator('img')).toHaveCSS('transform', 'none');
  report.contact.push({ width, duration: motion.duration, imageMoves: true, textStable: true, pausesOffscreen: true, motionOff: true });
  report.failedImages.push(...await page.evaluate(() => [...document.images].filter(image => image.getAttribute('src') && image.complete && !image.naturalWidth).map(image => image.src)));
  const video = page.video();
  await context.close();
  if (video) await video.saveAs(`${output}/cinematic-homepage-walkthrough.webm`);
}
await browser.close();
await writeFile(`${output}/cinematic-review-report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
