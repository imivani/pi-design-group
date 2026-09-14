import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';

const out = 'design/review';
const prefix = `${out}/navigation-refinement`;
const report = { created: new Date().toISOString(), findings: [], errors: [], header: {}, menuFrames: [], search: {}, screenshots: [] };
const browser = await chromium.launch({ channel: 'chrome' });
const inspect = page => page.evaluate(() => {
  const header = document.querySelector('#site-header'), style = getComputedStyle(header), rect = header.getBoundingClientRect();
  return { theme: header.dataset.theme, height: rect.height, background: style.background, blur: style.backdropFilter, shadow: style.boxShadow, horizontalOverflow: document.documentElement.scrollWidth > innerWidth, video: !!document.querySelector('#hero-video'), pauseButton: !!document.querySelector('[data-video-toggle], #hero-video-toggle') };
});
const ready = async page => {
  page.on('pageerror', error => report.errors.push(error.message));
  await page.waitForFunction(() => document.querySelector('#site-search-dialog')?.dataset.ready === 'true');
  await page.evaluate(() => document.fonts.ready);
};
const shot = async (page, name) => {
  const path = `${prefix}-${name}.png`;
  await page.screenshot({ path }); report.screenshots.push(path);
};
const scrollAbout = async page => {
  await page.locator('#about').evaluate(element => scrollTo({ top: scrollY + element.getBoundingClientRect().top - document.querySelector('#site-header').getBoundingClientRect().height + 2, behavior: 'instant' }));
  await page.waitForFunction(() => document.querySelector('#site-header').dataset.theme === 'light');
  await page.waitForTimeout(650);
};
const motion = (page, choice) => page.evaluate(value => {
  const select = document.querySelector('#motion-choice');
  select.value = value; select.dispatchEvent(new Event('change', { bubbles: true }));
}, choice);
const opacity = page => page.locator('#site-search-results').evaluate(element => ({
  opacity: Number(getComputedStyle(element).opacity),
  running: element.getAnimations().filter(animation => animation.playState === 'running').length,
  duration: element.getAnimations()[0]?.effect?.getTiming().duration,
}));
const decodedResults = page => page.waitForFunction(() => [...document.querySelectorAll('[data-search-project]:not([hidden]) img')].every(image => image.complete && image.naturalWidth > 0));

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, recordVideo: { dir: out, size: { width: 1440, height: 960 } } });
  const page = await context.newPage();
  const start = Date.now();
  await page.goto('http://127.0.0.1:4321/'); await ready(page);
  await page.waitForTimeout(500);
  report.header['1440-hero'] = await inspect(page);
  await shot(page, '1440-hero');
  await scrollAbout(page);
  report.header['1440-home-light'] = await inspect(page);
  await shot(page, '1440-home-light');
  for (const menu of ['projects', 'services', 'projects', 'services']) {
    await page.locator(`[data-menu-trigger="${menu}"]`).hover();
    await page.waitForFunction(menu => document.querySelector('#desktop-navigation').dataset.menu === menu && document.querySelector('#desktop-navigation').dataset.open === 'true', menu);
    await page.waitForTimeout(300);
    report.menuFrames.push({ menu, ...await page.locator('#desktop-navigation').boundingBox() });
  }
  await shot(page, '1440-services');
  await page.keyboard.press('Escape');
  await page.locator('.header-search').click();
  await decodedResults(page);
  const input = page.locator('#site-search-input');
  await input.pressSequentially('D’Arc', { delay: 140 });
  await page.waitForTimeout(500);
  await shot(page, 'search-before-refinement');
  await input.press('y');
  report.search.start = await opacity(page);
  await page.waitForTimeout(115);
  report.search.middle = await opacity(page);
  await shot(page, 'search-mid-fade');
  await page.waitForTimeout(500);
  report.search.settled = await opacity(page);
  report.search.matches = await page.locator('[data-search-project]:visible').evaluateAll(links => links.map(link => link.dataset.searchProject));
  await shot(page, 'search-settled');
  await input.fill('Set'); await page.waitForTimeout(70);
  const before = await opacity(page);
  await input.press('o');
  const after = await opacity(page);
  report.search.continuedTyping = { before, after };
  await page.waitForTimeout(550);
  await input.fill('Evanston');
  await input.press('Enter');
  await page.waitForURL('**/evanston'); await ready(page);
  report.search.quickEnter = page.url();
  await page.waitForTimeout(700);
  report.header['1440-project-light'] = await inspect(page);
  await shot(page, '1440-project-light');
  await page.evaluate(() => scrollTo({ top: 470, behavior: 'smooth' }));
  await page.waitForTimeout(700);
  await shot(page, '1440-project-photo-behind-glass');
  const remaining = 18000 - (Date.now() - start);
  if (remaining > 0) await page.waitForTimeout(remaining);
  const video = page.video();
  await context.close();
  const videoPath = await video.path();
  await fs.rename(videoPath, `${prefix}-motion.webm`);
  report.video = `${prefix}-motion.webm`; report.recordedSeconds = (Date.now() - start) / 1000;

  for (const width of [390, 320]) {
    const mobile = await browser.newContext({ viewport: { width, height: 844 }, hasTouch: true, isMobile: true });
    const page = await mobile.newPage();
    await page.goto('http://127.0.0.1:4321/'); await ready(page); await page.waitForTimeout(250);
    report.header[`${width}-hero`] = await inspect(page); await shot(page, `${width}-hero`);
    await scrollAbout(page); report.header[`${width}-home-light`] = await inspect(page); await shot(page, `${width}-home-light`);
    await page.goto('http://127.0.0.1:4321/crestmontwest'); await ready(page); await page.waitForTimeout(400);
    report.header[`${width}-project-light`] = await inspect(page); await shot(page, `${width}-project-light`);
    await page.locator('.mobile-menu-button').click();
    await page.locator('#mobile-navigation [data-project-search]').click();
    await page.locator('#site-search-input').fill('D’Arcy'); await decodedResults(page); await page.waitForTimeout(500);
    await shot(page, `${width}-search`);
    report.search[`${width}-overflow`] = await page.locator('#site-search-dialog').evaluate(element => element.scrollWidth > element.clientWidth);
    await mobile.close();
  }

  {
  const checks = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await checks.newPage(); await page.goto('http://127.0.0.1:4321/'); await ready(page);
  await page.locator('.header-search').click();
  for (const choice of ['reduced', 'off']) {
    await motion(page, 'system');
    await page.locator('#site-search-input').fill(choice === 'reduced' ? 'Seton' : 'Crestmont');
    await motion(page, choice);
    report.search[`${choice}-interrupt`] = await opacity(page);
    await page.locator('#site-search-input').fill('D’Arcy');
    report.search[`${choice}-new-query`] = await opacity(page);
    await page.waitForTimeout(160);
    report.search[`${choice}-settled`] = await opacity(page);
  }
  await page.locator('#site-search-input').press('Escape');
  report.search.escapeCloses = await page.locator('#site-search-dialog').evaluate(dialog => !dialog.open);
  await checks.close();
  }

  for (const [name, state] of Object.entries(report.header)) if (state.horizontalOverflow) report.findings.push(`${name} has horizontal overflow`);
  const geometry = report.menuFrames.map(({ x, y, width, height }) => [x, y, width, height]);
  if (geometry.some(frame => frame.some((value, index) => Math.abs(value - geometry[0][index]) > .5))) report.findings.push('Menu geometry changes between Projects and Services');
  if (report.search.middle.opacity <= report.search.start.opacity || report.search.middle.opacity >= 1 || report.search.settled.opacity !== 1) report.findings.push('Search fade does not progress and settle correctly');
  if (report.search['reduced-interrupt'].running || report.search['off-interrupt'].running || report.search['off-new-query'].running) report.findings.push('Motion preference leaves a result animation active');
  if (!report.search.escapeCloses) report.findings.push('Escape failed to close search');
  await fs.writeFile(`${prefix}-report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); }
