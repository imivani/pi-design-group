import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const output = 'design/review';
await mkdir(`${output}/featured-autoplay-recording`, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const report = { errors: [], changes: [], widths: [] };
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, recordVideo: { dir: `${output}/featured-autoplay-recording`, size: { width: 1440, height: 1000 } } });
const page = await context.newPage();
page.on('pageerror', error => report.errors.push(error.message));
await page.goto('http://127.0.0.1:4321/');
await page.mouse.move(0, 0);
await page.locator('#featured').evaluate(element => scrollTo(0, element.getBoundingClientRect().top + scrollY - 80));
await page.waitForFunction(() => document.querySelector('#featured').dataset.featuredAutoplay === 'running');
const started = Date.now();
for (const view of ['courtyard', 'play', 'planting', 'courtyard']) {
  if (report.changes.length) await page.waitForFunction(view => document.querySelector('[data-featured-view][aria-selected="true"]').dataset.featuredView === view, view, { timeout: 12000 });
  const state = await page.locator('#featured').evaluate(section => ({
    image: section.querySelector('[data-featured-image]').getAttribute('src'),
    detail: section.querySelector('[data-featured-detail]').getAttribute('src'),
    animations: section.querySelector('[data-featured-image]').getAnimations().map(animation => ({ duration: animation.effect.getTiming().duration, frames: animation.effect.getKeyframes().map(frame => frame.transform) })),
    background: getComputedStyle(section).backgroundColor,
  }));
  report.changes.push({ view, elapsed: Date.now() - started, ...state });
  if (view === 'play') { await page.waitForTimeout(220); await page.screenshot({ path: `${output}/featured-autoplay-mid-transition.png` }); }
  await page.waitForFunction(() => !document.querySelector('.featured-outgoing'));
}
const video = page.video();
await context.close();
await video.saveAs(`${output}/featured-autoplay-real-timing.webm`);

for (const width of [1440, 1100, 1024, 390, 320]) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  await page.addInitScript(() => localStorage.setItem('pi-motion', 'off'));
  await page.goto('http://127.0.0.1:4321/');
  const section = page.locator('#featured');
  await section.scrollIntoViewIfNeeded();
  await page.locator('[data-featured-image]').evaluate(image => image.decode());
  await page.locator('[data-featured-detail]').evaluate(image => image.decode());
  // Hide the fixed header only in section crops, leaving the actual recording unchanged.
  await page.addStyleTag({ content: '.site-header { visibility:hidden !important; }' });
  await section.screenshot({ path: `${output}/featured-autoplay-layout-${width}.png` });
  report.widths.push(await page.locator('.featured-controls').evaluate((controls, width) => ({
    width,
    overflow: document.documentElement.scrollWidth > innerWidth,
    labels: [...controls.querySelectorAll('[data-featured-view]')].map(button => ({ label: button.textContent, width: button.clientWidth, contentWidth: button.scrollWidth })),
    failedImages: [...document.querySelectorAll('#featured img')].filter(image => image.complete && !image.naturalWidth).length,
  }), width));
  await page.close();
}
await browser.close();
await writeFile(`${output}/featured-autoplay-report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
