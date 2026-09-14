import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';

const output = 'design/review';
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: 'no-preference',
  recordVideo: { dir: `${output}/recordings`, size: { width: 1440, height: 1000 } },
});
await context.addInitScript(() => localStorage.setItem('pi-motion', 'system'));
const page = await context.newPage();
const errors = [], findings = [], checks = {};
page.on('pageerror', error => errors.push(error.message));
const pause = (ms = 550) => page.waitForTimeout(ms);
const screenshot = name => page.screenshot({ path: `${output}/premium-${name}.png` });
const scroll = async selector => {
  await page.mouse.move(1415, 760);
  await page.locator(selector).evaluate(element => element.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  await pause(1000);
};

try {
  await page.goto('http://127.0.0.1:4321/');
  await page.locator('html[data-enhanced]').waitFor();
  await pause(800);
  checks.motion = await page.locator('html').getAttribute('data-motion');
  await screenshot('desktop-hero');

  await page.locator('[data-menu-trigger="projects"]').hover();
  await pause(450);
  await page.locator('button[data-catalogue-open]').hover();
  await pause(600);
  checks.catalogueCount = await page.locator('[data-catalogue-project]').count();
  await page.locator('[data-catalogue-project="evanston"]').hover();
  await pause(500);
  await screenshot('desktop-catalogue');
  await page.locator('[data-catalogue-project="rona"]').hover();
  await pause(500);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await page.locator('[data-menu-trigger="services"]').hover();
  await pause(450);
  await page.locator('.service-menu-link').last().hover();
  await pause(450);
  await screenshot('desktop-services-menu');
  await page.keyboard.press('Escape');

  await scroll('#services');
  await page.locator('[data-service-panel="commercial"]').hover();
  await pause(700);
  await page.locator('[data-service-panel="parks"]').hover();
  await pause(700);
  await screenshot('desktop-services');

  await scroll('#featured');
  await page.locator('[data-featured-view="play"]').click();
  await pause(550);
  await page.locator('[data-featured-view="planting"]').click();
  await pause(550);
  await screenshot('desktop-featured');
  await page.mouse.wheel(0, 440);
  await pause(600);
  await screenshot('desktop-featured-story');

  await scroll('#why');
  await page.locator('[data-detail-select="paths"]').hover();
  await pause(550);
  await screenshot('desktop-details');
  await page.locator('.detail-desk-links [data-open-drawing]').click();
  await pause(650);
  await screenshot('desktop-drawing');
  await page.locator('#detail-viewer-zoom').click();
  await pause(450);
  await page.keyboard.press('Escape');
  await pause(450);

  await scroll('#projects');
  await page.locator('[data-filter="commercial"]').click();
  await pause(450);
  await page.locator('button[data-view="index"]').click();
  await pause(450);
  await screenshot('desktop-project-index');
  await page.locator('button[data-view="grid"]').click();
  await pause(450);
  await page.locator('[data-filter="all"]').click();
  await pause(450);
  await screenshot('desktop-project-grid');
  await scroll('#contact');
  await screenshot('desktop-contact');
  checks.desktop = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth,
    uppercaseLabels: [...document.querySelectorAll('h1,h2,h3,button,.site-wordmark')].filter(el => getComputedStyle(el).textTransform === 'uppercase').length,
    animations: document.getAnimations().filter(animation => animation.playState === 'running').length,
  }));
} catch (error) {
  findings.push({ stage: 'desktop sequence', error: error.message });
} finally {
  await context.close();
  await page.video().saveAs(`${output}/premium-motion.webm`);
}

const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
await mobileContext.addInitScript(() => localStorage.setItem('pi-motion', 'system'));
const mobile = await mobileContext.newPage();
mobile.on('pageerror', error => errors.push(error.message));
const mobileShot = name => mobile.screenshot({ path: `${output}/premium-mobile-${name}.png` });
try {
  await mobile.goto('http://127.0.0.1:4321/');
  await mobile.waitForTimeout(700);
  await mobileShot('hero');
  await mobile.locator('.mobile-menu-button').click();
  await mobile.locator('[data-mobile-disclosure="mobile-project-links"]').click();
  await mobile.locator('[data-mobile-disclosure="mobile-project-catalogue"]').click();
  await mobile.waitForTimeout(400);
  await mobileShot('catalogue');
  checks.mobileCatalogueCount = await mobile.locator('.mobile-catalogue-links>a').count();
  await mobile.keyboard.press('Escape');
  for (const [section, name] of [['#services', 'services'], ['#featured', 'featured'], ['#why', 'details'], ['#projects', 'projects'], ['#contact', 'contact']]) {
    await mobile.locator(section).evaluate(element => element.scrollIntoView({ block: 'start' }));
    await mobile.waitForTimeout(600);
    if (name === 'featured') { await mobile.locator('[data-featured-view="play"]').click(); await mobile.waitForTimeout(450); }
    if (name === 'details') { await mobile.locator('[data-detail-select="paths"]').click(); await mobile.waitForTimeout(450); }
    await mobileShot(name);
  }
  await mobile.locator('.detail-desk-links [data-open-drawing]').click();
  await mobile.waitForTimeout(550);
  await mobileShot('drawing');
  await mobile.locator('#detail-viewer-close').click();
  checks.mobile = await mobile.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth,
    failedImages: [...document.images].filter(img => img.getAttribute('src') && img.complete && !img.naturalWidth).map(img => img.src),
    uppercaseLabels: [...document.querySelectorAll('h1,h2,h3,button,.site-wordmark')].filter(el => getComputedStyle(el).textTransform === 'uppercase').length,
  }));
} catch (error) {
  findings.push({ stage: 'mobile sequence', error: error.message });
}
await mobileContext.close();
await browser.close();
await fs.writeFile(`${output}/premium-motion-review.json`, JSON.stringify({ date: new Date().toISOString(), errors, findings, checks }, null, 2));
console.log(JSON.stringify({ errors, findings, checks }));
