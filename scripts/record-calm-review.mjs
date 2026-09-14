import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';

const out = 'design/review';
const url = 'http://127.0.0.1:4321/';
const report = { date: new Date().toISOString(), errors: [], findings: [], checks: {}, screenshots: [] };
const browser = await chromium.launch({ channel: 'chrome' });
const capture = async (page, name, options = {}) => {
  const path = `${out}/calm-review-${name}.png`;
  await page.screenshot({ path, ...options });
  report.screenshots.push(path);
};
const observeErrors = page => page.on('pageerror', error => report.errors.push(error.message));
const scroll = async (page, selector, delay = 650) => {
  await page.locator(selector).evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  await page.waitForFunction(selector => {
    const target = document.querySelector(selector);
    const padding = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    return Math.abs(target.getBoundingClientRect().top - padding) < 3 || scrollY >= document.documentElement.scrollHeight - innerHeight - 3;
  }, selector, { timeout: 5000 });
  await page.waitForTimeout(delay);
};
const inspect = page => page.evaluate(() => {
  const box = selector => {
    const element = document.querySelector(selector), rect = element.getBoundingClientRect();
    return { text: element.textContent.trim(), width: rect.width, scrollWidth: element.scrollWidth, fontSize: getComputedStyle(element).fontSize };
  };
  const video = document.querySelector('#hero-video');
  return {
    width: innerWidth,
    overflow: document.documentElement.scrollWidth > innerWidth,
    uppercase: [...document.querySelectorAll('h1,h2,h3,button,.site-wordmark')].filter(element => getComputedStyle(element).textTransform === 'uppercase').length,
    failedImages: [...document.images].filter(image => image.complete && image.getAttribute('src') && !image.naturalWidth).map(image => image.src),
    headings: { about: box('#practice-title'), expertise: box('#services-title'), featured: box('#featured-title'), details: box('#details-title') },
    frame: { border: getComputedStyle(document.body, '::before').borderLeftColor, width: getComputedStyle(document.body, '::before').width, header: getComputedStyle(document.querySelector('.site-header__inner')).borderLeftColor },
    video: { exists: !!video, src: video?.currentSrc || video?.dataset.src, paused: video?.paused, controls: video?.controls, pauseButtonCount: document.querySelectorAll('#video-toggle,.video-toggle').length },
    detailsBackground: getComputedStyle(document.querySelector('#why')).backgroundColor,
  };
});

// Reconstruct the real image and its two CSS gradients in a read-only canvas.
// Sampling beneath the text avoids changing or hiding any rendered page content.
const serviceContrast = page => page.evaluate(async () => {
  const split = text => { const parts = []; let depth = 0, start = 0; for (let i = 0; i < text.length; i++) { if (text[i] === '(') depth++; if (text[i] === ')') depth--; if (text[i] === ',' && !depth) { parts.push(text.slice(start, i).trim()); start = i + 1; } } parts.push(text.slice(start).trim()); return parts; };
  const linear = (context, css, x, y, width, height) => {
    if (!css.startsWith('linear-gradient(')) return;
    const values = split(css.slice(16, -1));
    if (/deg$/.test(values[0])) values.shift();
    const stops = values.map((value, index) => {
      const match = value.match(/^(rgba?\([^)]*\)|transparent|#[\da-f]+)(?:\s+([\d.]+)(%|px))?$/i);
      if (!match) throw new Error(`Unrecognized gradient stop: ${value}`);
      return { color: match[1], offset: match[2] ? Number(match[2]) / (match[3] === '%' ? 100 : height) : index === 0 ? 0 : index === values.length - 1 ? 1 : null };
    });
    for (let i = 1; i < stops.length - 1; i++) if (stops[i].offset === null) {
      let end = i + 1; while (stops[end].offset === null) end++;
      stops[i].offset = stops[i - 1].offset + (stops[end].offset - stops[i - 1].offset) / (end - i + 1);
    }
    const gradient = context.createLinearGradient(x, y, x, y + height);
    for (const stop of stops) gradient.addColorStop(Math.max(0, Math.min(1, stop.offset)), stop.color);
    context.fillStyle = gradient; context.fillRect(x, y, width, height);
  };
  const luminance = values => values.slice(0, 3).reduce((total, value, index) => { const c = value / 255; return total + (c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4) * [.2126, .7152, .0722][index]; }, 0);
  const results = [];
  for (const panel of document.querySelectorAll('.service-panel')) {
    const photo = panel.querySelector('img'); await photo.decode();
    const rect = panel.getBoundingClientRect(), width = Math.ceil(rect.width), height = Math.ceil(rect.height);
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const scale = Math.max(width / photo.naturalWidth, height / photo.naturalHeight);
    const [positionX, positionY] = getComputedStyle(photo).objectPosition.split(' ').map(Number.parseFloat);
    ctx.drawImage(photo, (width - photo.naturalWidth * scale) * positionX / 100, (height - photo.naturalHeight * scale) * positionY / 100, photo.naturalWidth * scale, photo.naturalHeight * scale);
    linear(ctx, getComputedStyle(panel.querySelector('.service-shade')).backgroundImage, 0, 0, width, height);
    const info = panel.querySelector('.service-information'), infoRect = info.getBoundingClientRect(), pseudo = getComputedStyle(info, '::before'), top = Number.parseFloat(pseudo.top);
    linear(ctx, pseudo.backgroundImage, infoRect.x - rect.x, infoRect.y - rect.y + top, infoRect.width, infoRect.height - top);
    const pixels = ctx.getImageData(0, 0, width, height).data;
    for (const selector of ['.service-selector span', '.service-description p', '.service-caption']) {
      const element = panel.querySelector(selector);
      if (!element || getComputedStyle(element).visibility === 'hidden' || element.getBoundingClientRect().height === 0) continue;
      const foreground = luminance(getComputedStyle(element).color.match(/[\d.]+/g).map(Number));
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT), ratios = [];
      while (walker.nextNode()) {
        const range = document.createRange(); range.selectNodeContents(walker.currentNode);
        for (const textRect of range.getClientRects()) {
          for (let y = Math.max(0, Math.ceil(textRect.top - rect.top)); y < Math.min(height, textRect.bottom - rect.top); y += 2) {
            for (let x = Math.max(0, Math.ceil(textRect.left - rect.left)); x < Math.min(width, textRect.right - rect.left); x += 2) {
              const offset = (y * width + x) * 4, background = luminance([pixels[offset], pixels[offset + 1], pixels[offset + 2]]);
              ratios.push((Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05));
            }
          }
        }
      }
      ratios.sort((a, b) => a - b);
      if (ratios.length) results.push({ service: panel.dataset.servicePanel, active: panel.dataset.active, selector, minimum: Number(ratios[0].toFixed(2)), fifthPercentile: Number(ratios[Math.floor(ratios.length * .05)].toFixed(2)), required: selector.includes('selector') && Number.parseFloat(getComputedStyle(element).fontSize) >= 24 ? 3 : 4.5 });
    }
  }
  return results;
});

const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference', recordVideo: { dir: `${out}/calm-review-recordings`, size: { width: 1440, height: 1000 } } });
await context.addInitScript(() => localStorage.setItem('pi-motion', 'system'));
const page = await context.newPage(); observeErrors(page);
try {
  await page.goto(url); await page.locator('html[data-enhanced]').waitFor(); await page.waitForTimeout(900);
  await capture(page, 'desktop-hero');
  report.checks.heroAtRest = await page.locator('#hero-video').evaluate(video => ({ playing: !video.paused, currentTime: video.currentTime, src: video.currentSrc }));
  await scroll(page, '#about'); await capture(page, 'desktop-about');
  await scroll(page, '#services');
  await page.locator('[data-service="commercial"]').hover(); await page.waitForTimeout(600);
  await page.locator('[data-service="parks"]').hover(); await page.waitForTimeout(600);
  await capture(page, 'desktop-services');
  await scroll(page, '#featured'); await capture(page, 'desktop-featured');
  await page.locator('[data-featured-view="play"]').hover(); await page.waitForTimeout(650);
  await page.locator('[data-featured-view="planting"]').hover(); await page.waitForTimeout(650);
  await scroll(page, '#why');
  await page.locator('[data-detail-select="paths"]').hover(); await page.waitForTimeout(550);
  await capture(page, 'desktop-details');
  await page.locator('.detail-desk-links [data-open-drawing]').click(); await page.waitForTimeout(550);
  await capture(page, 'desktop-drawing');
  await page.locator('#detail-viewer-close').click(); await page.waitForTimeout(250);
  await scroll(page, '#projects');
  await page.locator('[data-project="darcy"] .project-link').hover(); await page.waitForTimeout(700);
  await capture(page, 'desktop-archive-hover');
  await scroll(page, '#contact', 850); await capture(page, 'desktop-contact');
  await page.waitForTimeout(1600);
} catch (error) { report.findings.push({ stage: 'recording', error: error.message }); }
finally { await context.close(); await page.video().saveAs(`${out}/calm-motion.webm`); }

// Separate inspection contexts keep measurements and long-page captures out of the short motion film.
for (const width of [1440, 390, 320]) {
  const inspection = await browser.newContext({ viewport: { width, height: width === 1440 ? 1000 : 844 }, isMobile: width < 600, hasTouch: width < 600, reducedMotion: 'no-preference' });
  await inspection.addInitScript(() => localStorage.setItem('pi-motion', 'system'));
  const current = await inspection.newPage(); observeErrors(current);
  try {
    await current.goto(url); await current.locator('html[data-enhanced]').waitFor(); await current.waitForTimeout(650);
    if (width < 600) await capture(current, `${width}-hero`);
    for (const [selector, name] of [['#about', 'about'], ['#services', 'services'], ['#featured', 'featured'], ['#why', 'details'], ['#projects', 'archive'], ['#contact', 'contact'], ['.site-footer', 'footer']]) {
      await scroll(current, selector);
      if (name === 'services') {
        report.checks[`serviceContrast${width}`] = [];
        for (const id of ['multifamily', 'commercial', 'parks']) {
          const control = current.locator(`[data-service="${id}"]`);
          if (width < 600) { if (await control.getAttribute('aria-expanded') !== 'true') await control.tap(); }
          else await control.hover();
          await current.waitForTimeout(550);
          report.checks[`serviceContrast${width}`].push({ selection: id, samples: await serviceContrast(current) });
          await capture(current, `${width}-service-${id}`);
        }
      }
      if (width < 600 || name === 'footer') await capture(current, `${width}-${name}`);
      if (width < 600 && name === 'featured') {
        await current.locator('[data-featured-view="play"]').tap(); await current.waitForTimeout(550);
        await capture(current, `${width}-featured-choice`);
      }
      if (width < 600 && name === 'details') {
        await current.locator('[data-detail-select="paths"]').tap(); await current.waitForTimeout(450);
        await capture(current, `${width}-detail-choice`);
      }
    }
    // Naturally enter each row before making a full-page capture; no CSS is disabled or overridden.
    const documentHeight = await current.evaluate(() => document.documentElement.scrollHeight);
    for (let top = 0; top < documentHeight; top += 650) {
      await current.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), top);
      await current.waitForTimeout(85);
    }
    await current.waitForTimeout(650);
    await current.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await current.waitForTimeout(650);
    report.checks[`layout${width}`] = await inspect(current);
    await capture(current, `${width}-full`, { fullPage: true });
  } catch (error) { report.findings.push({ stage: `inspection${width}`, error: error.message }); }
  await inspection.close();
}
await browser.close();
await fs.writeFile(`${out}/calm-review-report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ errors: report.errors, findings: report.findings, checks: report.checks, screenshots: report.screenshots.length }));
