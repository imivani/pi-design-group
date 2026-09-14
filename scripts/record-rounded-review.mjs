import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';

const out = 'design/review';
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const errors = [], findings = [], checks = {};
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference', recordVideo: { dir: `${out}/recordings`, size: { width: 1440, height: 1000 } } });
await context.addInitScript(() => localStorage.setItem('pi-motion', 'system'));
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
const pause = (ms = 500) => page.waitForTimeout(ms);
const shot = name => page.screenshot({ path: `${out}/rounded-review-desktop-${name}.png` });
const scroll = async selector => {
  await page.mouse.move(1420, 900);
  await page.locator(selector).evaluate(element => element.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  await pause(850);
};
try {
  await page.goto('http://127.0.0.1:4321/');
  await page.locator('html[data-enhanced]').waitFor();
  await pause(600);
  checks.motion = await page.locator('html').getAttribute('data-motion');
  checks.video = await page.locator('#hero-video').evaluate(video => ({ src: video.currentSrc, playing: !video.paused }));
  await shot('hero');
  await page.locator('[data-menu-trigger="projects"]').hover();
  await pause(350);
  await page.locator('button[data-catalogue-open]').hover();
  await pause(500);
  await shot('catalogue');
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  await scroll('#services');
  await page.locator('[data-service-panel="commercial"]').hover(); await pause(600);
  await shot('services');
  await scroll('#featured');
  await shot('featured');
  await page.locator('.featured-project-link').hover(); await pause(500);
  await page.locator('.featured-detail-link').hover(); await pause(500);
  await page.locator('[data-featured-view="play"]').click(); await pause(550);
  await page.locator('[data-featured-view="planting"]').click(); await pause(550);
  await shot('featured-planting');
  checks.featured = await page.locator('#featured').evaluate(section => ({
    heading: getComputedStyle(section.querySelector('h2')).fontSize,
    projectName: getComputedStyle(section.querySelector('h3')).fontSize,
    radius: getComputedStyle(section.querySelector('.featured-card')).borderRadius,
    overflow: section.scrollWidth > section.clientWidth,
  }));
  await scroll('#why');
  await page.locator('[data-detail-select="planting"]').hover(); await pause(500);
  await page.locator('[data-detail-select="paths"]').hover(); await pause(550);
  await shot('details');
  await page.locator('.detail-desk-links [data-open-drawing]').click(); await pause(650);
  await shot('drawing');
  await page.locator('#detail-viewer-zoom').click(); await pause(400);
  await page.keyboard.press('Escape'); await pause(350);
  await scroll('#projects');
  await shot('archive-before');
  const card = page.locator('[data-project="darcy"] .project-link');
  const before = await card.boundingBox();
  await card.hover(); await pause(600);
  const after = await card.boundingBox();
  checks.archiveHover = { before, after, imageHeight: await card.locator('.project-image img').evaluate(image => image.getBoundingClientRect().height) };
  await shot('archive-hover');
  await card.click(); await page.waitForURL('**/darcy'); await pause(650);
  await shot('project-arrival');
  await page.goBack(); await pause(700);
  await scroll('#contact');
  await page.locator('.contact-start').hover(); await pause(450);
  await page.locator('.contact-direct a').first().hover(); await pause(450);
  await shot('contact');
  await page.locator('.footer-return').scrollIntoViewIfNeeded();
  await page.locator('.site-footer nav a').first().hover(); await pause(350);
  await shot('footer');
  checks.desktop = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, uppercase: [...document.querySelectorAll('h1,h2,h3,button,.site-wordmark')].filter(el => getComputedStyle(el).textTransform === 'uppercase').length }));
} catch (error) { findings.push({ stage: 'desktop', error: error.message }); }
finally { await context.close(); await page.video().saveAs(`${out}/rounded-motion.webm`); }

for (const width of [390, 320]) {
  const mobileContext = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
  await mobileContext.addInitScript(() => localStorage.setItem('pi-motion', 'system'));
  const mobile = await mobileContext.newPage();
  mobile.on('pageerror', error => errors.push(error.message));
  try {
    await mobile.goto('http://127.0.0.1:4321/'); await mobile.waitForTimeout(550);
    await mobile.screenshot({ path: `${out}/rounded-review-mobile-${width}-hero.png` });
    for (const [selector, name] of [['#services', 'services'], ['#featured', 'featured'], ['#why', 'details'], ['#projects', 'archive'], ['#contact', 'contact'], ['.site-footer', 'footer']]) {
      await mobile.locator(selector).evaluate(el => el.scrollIntoView({ block: 'start' }));
      await mobile.waitForTimeout(600);
      await mobile.screenshot({ path: `${out}/rounded-review-mobile-${width}-${name}.png` });
      if (name === 'featured') {
        await mobile.locator('[data-featured-view="play"]').click(); await mobile.waitForTimeout(550);
        await mobile.screenshot({ path: `${out}/rounded-review-mobile-${width}-featured-tabs.png` });
      }
      if (name === 'details') {
        await mobile.locator('[data-detail-select="paths"]').click(); await mobile.waitForTimeout(450);
        await mobile.screenshot({ path: `${out}/rounded-review-mobile-${width}-detail-selection.png` });
        await mobile.locator('.detail-desk-links [data-open-drawing]').click(); await mobile.waitForTimeout(450);
        await mobile.screenshot({ path: `${out}/rounded-review-mobile-${width}-drawing.png` });
        await mobile.locator('#detail-viewer-close').click();
      }
    }
    checks[`mobile${width}`] = await mobile.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      failedImages: [...document.images].filter(img => img.getAttribute('src') && img.complete && !img.naturalWidth).map(img => img.src),
      uppercase: [...document.querySelectorAll('h1,h2,h3,button,.site-wordmark')].filter(el => getComputedStyle(el).textTransform === 'uppercase').length,
      featureHeading: getComputedStyle(document.querySelector('#featured-title')).fontSize,
      projectName: getComputedStyle(document.querySelector('.featured-project-name')).fontSize,
      touchArchiveActionVisible: getComputedStyle(document.querySelector('.project-open')).opacity,
    }));
  } catch (error) { findings.push({ stage: `mobile${width}`, error: error.message }); }
  await mobileContext.close();
}
await browser.close();
await fs.writeFile(`${out}/rounded-review-report.json`, JSON.stringify({ date: new Date().toISOString(), errors, findings, checks }, null, 2));
console.log(JSON.stringify({ errors, findings, checks }));
