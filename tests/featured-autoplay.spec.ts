import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function showFeatured(page: Page) {
  await page.goto('/');
  await page.mouse.move(0, 0);
  await page.locator('.featured-media').evaluate(element => element.scrollIntoView({ block: 'center' }));
  await expect(page.locator('.featured-presentation')).toHaveAttribute('data-reveal-state', 'done');
}
const selected = (page: Page) => page.locator('[data-featured-view][aria-selected="true"]');
const autoplay = (page: Page) => page.locator('#featured');
async function advance(page: Page, view: string) {
  await page.clock.fastForward(7100);
  await expect(selected(page)).toHaveAttribute('data-featured-view', view);
  await expect(page.locator('.featured-outgoing')).toHaveCount(0);
  await expect(autoplay(page)).toHaveAttribute('data-featured-autoplay', 'running');
}

test('automatic views dwell, animate real photo pairs, and complete a full loop without moving controls', async ({ page }) => {
  await page.clock.install();
  await showFeatured(page);
  await expect(autoplay(page)).toHaveAttribute('data-featured-autoplay', 'running');
  await expect(autoplay(page)).toHaveCSS('background-color', 'rgb(27, 28, 29)');
  const before = await page.locator('.featured-controls').boundingBox();
  await page.clock.fastForward(6000);
  await expect(selected(page)).toHaveAttribute('data-featured-view', 'courtyard');
  await page.clock.fastForward(1200);
  await expect(selected(page)).toHaveAttribute('data-featured-view', 'play');
  await expect(page.locator('[data-featured-image]')).toHaveAttribute('src', '/media/gallery/crestmont-west/7.webp');
  await expect(page.locator('[data-featured-detail]')).toHaveAttribute('src', '/media/gallery/crestmont-west/4.webp');
  const movement = await page.locator('[data-featured-image]').evaluate(image => image.getAnimations().map(animation => ({
    duration: animation.effect?.getTiming().duration,
    frames: (animation.effect as KeyframeEffect).getKeyframes().map(frame => frame.transform),
  })));
  expect(movement).toEqual([{ duration: 650, frames: ['translateX(6px) scale(1.025)', 'translateX(0px) scale(1)'] }]);
  await expect(page.locator('.featured-outgoing')).toHaveCount(0);
  await expect(autoplay(page)).toHaveAttribute('data-featured-autoplay', 'running');
  await advance(page, 'planting');
  await expect(page.locator('[data-featured-detail]')).toHaveAttribute('src', '/media/gallery/crestmont-west/5.webp');
  await advance(page, 'courtyard');
  expect(await page.locator('.featured-controls').boundingBox()).toEqual(before);
  await expect(page.locator('.featured-status')).toBeEmpty();
});

test('hover, keyboard focus, explicit pause, offscreen and page lifecycle each suspend rotation', async ({ page }) => {
  await page.clock.install();
  await showFeatured(page);
  await page.locator('.featured-photo').hover();
  await expect(autoplay(page)).toHaveAttribute('data-featured-autoplay', 'paused');
  await page.clock.fastForward(15000);
  await expect(selected(page)).toHaveAttribute('data-featured-view', 'courtyard');
  await page.mouse.move(0, 0);
  await expect(autoplay(page)).toHaveAttribute('data-featured-autoplay', 'running');
  await page.locator('.featured-project-link').focus();
  await expect(autoplay(page)).toHaveAttribute('data-featured-autoplay', 'paused');
  await page.clock.fastForward(15000);
  await expect(selected(page)).toHaveAttribute('data-featured-view', 'courtyard');
  await page.locator('[data-featured-autoplay-toggle]').click();
  await page.mouse.move(0, 0);
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
  await expect(page.getByRole('button', { name: 'Resume automatic featured views' })).toBeVisible();
  await page.clock.fastForward(15000);
  await expect(selected(page)).toHaveAttribute('data-featured-view', 'courtyard');
  await page.getByRole('button', { name: 'Resume automatic featured views' }).click();
  await page.mouse.move(0, 0);
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
  await expect(autoplay(page)).toHaveAttribute('data-featured-autoplay', 'running');
  await page.evaluate(() => scrollTo(0, 0));
  await expect(autoplay(page)).toHaveAttribute('data-featured-autoplay', 'paused');
  await page.clock.fastForward(15000);
  await expect(selected(page)).toHaveAttribute('data-featured-view', 'courtyard');
  await page.locator('.featured-media').evaluate(element => element.scrollIntoView({ block: 'center' }));
  await expect(autoplay(page)).toHaveAttribute('data-featured-autoplay', 'running');
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.clock.fastForward(15000);
  await expect(selected(page)).toHaveAttribute('data-featured-view', 'courtyard');
  await page.evaluate(() => { Reflect.deleteProperty(document, 'hidden'); document.dispatchEvent(new Event('visibilitychange')); });
  await expect(autoplay(page)).toHaveAttribute('data-featured-autoplay', 'running');
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
  await page.clock.fastForward(15000);
  await expect(selected(page)).toHaveAttribute('data-featured-view', 'courtyard');
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  await expect(autoplay(page)).toHaveAttribute('data-featured-autoplay', 'running');
  await advance(page, 'play');
});

test('motion preferences disable automatic changes while manual controls remain available', async ({ page }) => {
  await page.clock.install();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await showFeatured(page);
  await expect(autoplay(page)).toHaveAttribute('data-featured-autoplay', 'off');
  await expect(page.locator('[data-featured-autoplay-toggle]')).toBeDisabled();
  await page.clock.fastForward(15000);
  await expect(selected(page)).toHaveAttribute('data-featured-view', 'courtyard');
  await page.locator('[data-featured-next]').click();
  await expect(selected(page)).toHaveAttribute('data-featured-view', 'play');
  await page.locator('#motion-choice').selectOption('off');
  await page.locator('[data-featured-next]').click();
  await expect(selected(page)).toHaveAttribute('data-featured-view', 'planting');
  await expect(page.locator('.featured-outgoing')).toHaveCount(0);
  expect(await page.locator('#featured').evaluate(section => section.getAnimations({ subtree: true }).length)).toBe(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.locator('#motion-choice').selectOption('system');
  await page.mouse.move(0, 0);
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
  await page.locator('.featured-media').evaluate(element => element.scrollIntoView({ block: 'center' }));
  await expect(autoplay(page)).toHaveAttribute('data-featured-autoplay', 'running');
  await advance(page, 'courtyard');
});

test('a delayed automatic image cannot override newer manual input', async ({ page }) => {
  await page.clock.install();
  let release!: () => void;
  const hold = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/gallery/crestmont-west/4.webp', async route => { await hold; await route.continue(); });
  await showFeatured(page);
  await page.clock.fastForward(7100);
  await expect(page.locator('#featured-perspective')).toHaveAttribute('aria-busy', 'true');
  await page.locator('[data-featured-next]').dispatchEvent('click');
  await expect(selected(page)).toHaveAttribute('data-featured-view', 'planting');
  release();
  await expect(page.locator('#featured-perspective')).not.toHaveAttribute('aria-busy');
  await expect(page.locator('[data-featured-detail]')).toHaveAttribute('src', '/media/gallery/crestmont-west/5.webp');
  await expect(page.locator('.featured-outgoing')).toHaveCount(0);
  await expect(selected(page)).toHaveAttribute('data-featured-view', 'planting');
});

test('pausing invalidates a pending automatic pair even when its files finish loading later', async ({ page }) => {
  await page.clock.install();
  let release!: () => void;
  const hold = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/gallery/crestmont-west/4.webp', async route => { await hold; await route.continue(); });
  await showFeatured(page);
  await page.clock.fastForward(7100);
  await expect(page.locator('#featured-perspective')).toHaveAttribute('aria-busy', 'true');
  await page.locator('[data-featured-autoplay-toggle]').dispatchEvent('click');
  release();
  await expect(page.locator('#featured-perspective')).not.toHaveAttribute('aria-busy');
  await page.clock.fastForward(15000);
  await expect(selected(page)).toHaveAttribute('data-featured-view', 'courtyard');
  await expect(page.locator('[data-featured-image]')).toHaveAttribute('src', '/media/featured-crestmont.webp');
  await expect(page.locator('[data-featured-detail]')).toHaveAttribute('src', '/media/img_2304.webp');
  await expect(page.locator('.featured-outgoing')).toHaveCount(0);
  await expect(page.locator('.featured-status')).toBeEmpty();
});

test('an unavailable automatic pair preserves the current view and can be retried', async ({ page }) => {
  await page.clock.install();
  await page.route('**/gallery/crestmont-west/4.webp', route => route.abort());
  await showFeatured(page);
  await page.clock.fastForward(7100);
  await expect(page.locator('.featured-status')).toContainText('Automatic views paused');
  await expect(selected(page)).toHaveAttribute('data-featured-view', 'courtyard');
  await expect(page.getByRole('button', { name: 'Resume automatic featured views' })).toBeVisible();
  await page.unroute('**/gallery/crestmont-west/4.webp');
  await page.locator('[data-featured-view="play"]').click();
  await expect(selected(page)).toHaveAttribute('data-featured-view', 'play');
  await expect(page.locator('[data-featured-detail]')).toHaveAttribute('src', '/media/gallery/crestmont-west/4.webp');
  await expect(page.locator('.featured-status')).toBeEmpty();
});

test('the additional control fits narrow desktop and phones without crowding photo choices', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('pi-motion', 'off'));
  for (const width of [320, 390, 1024, 1100, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await showFeatured(page);
    const crowded = await page.locator('.featured-controls').evaluate(controls => {
      const box = controls.getBoundingClientRect();
      const buttons = [...controls.querySelectorAll('button')];
      return buttons.filter(button => {
        const rect = button.getBoundingClientRect();
        return rect.left < box.left || rect.right > box.right || button.scrollWidth > button.clientWidth + 1;
      }).map(button => button.getAttribute('aria-label') || button.textContent);
    });
    expect(crowded, String(width)).toEqual([]);
    const audit = await new AxeBuilder({ page }).include('#featured').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(audit.violations.map(issue => ({ id: issue.id, nodes: issue.nodes.map(node => node.target) }))).toEqual([]);
  }
});
