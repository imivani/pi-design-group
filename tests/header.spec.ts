import { test, expect, type Page } from '@playwright/test';

const openProjects = (page: Page) => page.locator('[data-menu-trigger="projects"]');
const openServices = (page: Page) => page.locator('[data-menu-trigger="services"]');
const surface = (page: Page) => page.locator('#desktop-navigation');

test.describe('Reference navigation', () => {
  let errors: string[];
  test.beforeEach(async ({ page }) => {
    errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#site-header')).toHaveAttribute('data-ready', 'true');
  });
  test.afterEach(() => { expect(errors, 'Navigation must not produce browser errors').toEqual([]); });

  test('shared photographic surface opens, switches and stays within the viewport', async ({ page }) => {
    await expect(surface(page)).toHaveAttribute('inert', '');
    await expect(surface(page)).toHaveCSS('pointer-events', 'none');
    await expect(surface(page)).toHaveCSS('visibility', 'hidden');
    await openProjects(page).click();
    await expect(surface(page)).toHaveAttribute('data-open', 'true');
    await expect(surface(page)).not.toHaveAttribute('inert', '');
    await expect(page.locator('#projects-navigation')).toHaveAttribute('aria-hidden', 'false');
    const previews = page.locator('.project-menu-preview');
    await expect(previews).toHaveCount(3);
    await expect(previews.nth(0)).toHaveAttribute('href', '/darcy');
    await expect(previews.nth(2)).toHaveAttribute('href', '/seton');
    await expect.poll(() => previews.locator('img').evaluateAll((images) => images.every((image) => (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
    const bounds = await surface(page).boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(1440);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(960);
    await openServices(page).click();
    await expect(surface(page)).toHaveAttribute('data-menu', 'services');
    await expect(page.locator('#projects-navigation')).toHaveAttribute('inert', '');
    await expect(page.locator('#projects-navigation')).toHaveCSS('display', 'none');
    await expect(page.locator('#services-navigation')).not.toHaveAttribute('inert', '');
    await page.locator('[data-service-link="commercial"]').hover();
    await page.locator('[data-service-link="parks"]').hover();
    await expect(page.locator('[data-service-image="parks"]')).toHaveAttribute('data-active', 'true');
    await expect(page.locator('.service-menu-images img[data-active="true"]')).toHaveCount(1);
  });

  test('keyboard reading order, Escape and outside dismissal remain correct', async ({ page }) => {
    await openProjects(page).focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await expect(page.locator('button[data-catalogue-open]')).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(openProjects(page)).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('button[data-catalogue-open]')).toBeFocused();
    await page.locator('.project-menu-preview').last().focus();
    await page.keyboard.press('Tab');
    await expect(openServices(page)).toBeFocused();
    await expect(surface(page)).toHaveAttribute('data-open', 'false');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-service-link]').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(openServices(page)).toBeFocused();
    await expect(surface(page)).toHaveAttribute('inert', '');
    await expect(surface(page)).toHaveCSS('visibility', 'hidden');
    await openProjects(page).click();
    await page.locator('.desktop-nav a[href="#contact"]').click();
    await expect(surface(page)).toHaveAttribute('data-open', 'false');
    await expect(page.locator('#contact')).toBeFocused();
  });

  test('hover intent, pointer corridor and cancelled hover do not leave stale menus', async ({ page }) => {
    const projects = await openProjects(page).boundingBox();
    const services = await openServices(page).boundingBox();
    await page.mouse.move(projects!.x + projects!.width / 2, projects!.y + 20);
    await page.waitForTimeout(45);
    await page.mouse.move(services!.x + services!.width / 2, services!.y + 20);
    await page.waitForTimeout(45);
    await page.mouse.move(24, 460);
    await page.waitForTimeout(260);
    await expect(surface(page)).toHaveAttribute('data-open', 'false');
    await openProjects(page).hover();
    await expect(surface(page)).toHaveAttribute('data-menu', 'projects');
    await expect(surface(page)).toHaveAttribute('data-open', 'true');
    const box = await surface(page).boundingBox();
    await page.mouse.move(projects!.x + 20, box!.y + 30, { steps: 4 });
    await page.waitForTimeout(240);
    await expect(surface(page)).toHaveAttribute('data-open', 'true');
    await openServices(page).hover();
    await expect(surface(page)).toHaveAttribute('data-menu', 'services');
    await openProjects(page).hover();
    await expect(surface(page)).toHaveAttribute('data-menu', 'projects');
    await page.mouse.move(24, 460);
    await expect(surface(page)).toHaveAttribute('data-open', 'false');
    await expect(surface(page)).toHaveCSS('pointer-events', 'none');
  });

  test('open-close-open resolves to the newest state at several interruption points', async ({ page }) => {
    for (const interruption of [50, 130, 210]) {
      await openProjects(page).evaluate((button) => (button as HTMLButtonElement).click());
      await page.waitForTimeout(interruption);
      await openProjects(page).evaluate((button) => (button as HTMLButtonElement).click());
      await expect(surface(page)).toHaveAttribute('inert', '');
      await page.waitForTimeout(35);
      await openProjects(page).evaluate((button) => (button as HTMLButtonElement).click());
      await expect(surface(page)).toHaveAttribute('data-open', 'true');
      await expect(surface(page)).toHaveCSS('opacity', '1');
      await expect(surface(page)).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
      await page.keyboard.press('Escape');
      await expect(surface(page)).toHaveCSS('visibility', 'hidden');
    }
  });

  test('category and service navigation dispatch real selections and search receives focus', async ({ page }) => {
    await page.evaluate(() => {
      const holder = window as unknown as { navEvents: unknown[] };
      holder.navEvents = [];
      for (const name of ['pi:filter', 'pi:service']) document.addEventListener(name, (event) => holder.navEvents.push({ name, detail: (event as CustomEvent).detail }));
    });
    await openProjects(page).click();
    await page.locator('#projects-navigation [data-project-category="commercial"]').click();
    await expect.poll(() => page.evaluate(() => (window as unknown as { navEvents: unknown[] }).navEvents)).toContainEqual({ name: 'pi:filter', detail: { category: 'commercial' } });
    await openServices(page).click();
    await page.locator('[data-service-link="parks"]').click();
    await expect.poll(() => page.evaluate(() => (window as unknown as { navEvents: unknown[] }).navEvents)).toContainEqual({ name: 'pi:service', detail: { id: 'parks' } });
    await page.locator('.header-search').click();
    await expect(page.locator('#project-search')).toBeFocused();
    await expect(page).toHaveURL(/#projects$/);
    await expect(surface(page)).toHaveAttribute('inert', '');
  });

  test('header changes material at the hero boundary and live motion reduction removes travel', async ({ page }) => {
    await expect(page.locator('#site-header')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('#site-header')).toHaveAttribute('data-scrolled', 'false');
    await expect(page.locator('#site-header')).toHaveCSS('background-color', 'rgba(24, 39, 48, 0.22)');
    await page.evaluate(() => window.scrollTo({ top: 280, behavior: 'instant' }));
    await expect(page.locator('#site-header')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('#site-header')).toHaveAttribute('data-scrolled', 'true');
    await expect(page.locator('#site-header')).toHaveCSS('background-color', 'rgba(27, 35, 39, 0.96)');
    await page.locator('#why').scrollIntoViewIfNeeded();
    await expect(page.locator('#site-header')).toHaveAttribute('data-theme', 'light');
    await openProjects(page).click();
    await page.evaluate(() => { document.documentElement.dataset.motion = 'reduced'; });
    await expect(surface(page)).toHaveCSS('transform', 'none');
    await page.evaluate(() => { document.documentElement.dataset.motion = 'off'; });
    await expect(surface(page)).toHaveCSS('transition-duration', '0s');
    await openServices(page).click();
    await expect(surface(page)).toHaveCSS('opacity', '1');
    await expect(page.locator('#services-navigation')).toHaveCSS('opacity', '1');
    await page.keyboard.press('Escape');
    await expect(surface(page)).toHaveCSS('visibility', 'hidden');
  });

  test('mobile dialog traps focus, exposes real disclosures and closes from the keyboard', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const toggle = page.locator('.mobile-menu-button');
    const dialog = page.locator('#mobile-navigation');
    await toggle.click();
    await expect(dialog).toBeVisible();
    expect(await dialog.evaluate((element) => element.matches(':modal'))).toBe(true);
    await expect(dialog.locator('[data-mobile-close]')).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(dialog.locator('.site-wordmark')).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    // Chrome permits a modal user to visit browser chrome; the underlying page stays inert.
    if (await page.evaluate(() => document.activeElement === document.body)) await page.keyboard.press('Shift+Tab');
    await expect(dialog.locator('a[href="tel:+14035104071"]')).toBeFocused();
    const disclosure = dialog.locator('[data-mobile-disclosure="mobile-project-links"]');
    const body = dialog.locator('#mobile-project-links');
    await expect(body).toHaveAttribute('inert', '');
    await disclosure.click();
    await expect(disclosure).toHaveAttribute('aria-expanded', 'true');
    await expect(body).not.toHaveAttribute('inert', '');
    await expect.poll(() => body.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThan(180);
    await disclosure.evaluate((button) => (button as HTMLButtonElement).click());
    await expect(body).toHaveAttribute('inert', '');
    await page.waitForTimeout(70);
    await disclosure.evaluate((button) => (button as HTMLButtonElement).click());
    await expect.poll(() => body.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThan(180);
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(toggle).toBeFocused();
    await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
    await toggle.click();
    await dialog.locator('[data-project-search]').click();
    await expect(dialog).not.toBeVisible();
    await expect(page.locator('#project-search')).toBeFocused();
  });

  test('switching between compact and desktop while open keeps focus on a visible control', async ({ page }) => {
    await openProjects(page).focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('button[data-catalogue-open]')).toBeFocused();
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(surface(page)).toHaveAttribute('inert', '');
    await expect(page.locator('.mobile-menu-button')).toBeFocused();
    await page.locator('.mobile-menu-button').click();
    await page.setViewportSize({ width: 1440, height: 960 });
    await expect(page.locator('#mobile-navigation')).not.toBeVisible();
    await expect(page.locator('#site-header .site-wordmark')).toBeFocused();
    await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
  });

  test('320px navigation keeps its full name and controls readable with doubled text', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 760 });
    await page.evaluate(() => {
      // Text-only enlargement, including px-based sizes, exercises reflow beyond a normal viewport check.
      const elements = Array.from(document.querySelectorAll<HTMLElement>('#site-header, #site-header *, #mobile-navigation, #mobile-navigation *'));
      const sizes = elements.map((element) => [element, Number.parseFloat(getComputedStyle(element).fontSize)] as const);
      for (const [element, size] of sizes) if (!(element instanceof SVGElement)) element.style.fontSize = `${size * 2}px`;
    });
    const header = page.locator('#site-header');
    await expect(header.locator('.site-wordmark')).toHaveText('Pi Design Group');
    expect(await header.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    const menuBounds = await page.locator('.mobile-menu-button').boundingBox();
    expect(menuBounds!.x + menuBounds!.width).toBeLessThanOrEqual(320);
    await page.locator('.mobile-menu-button').click();
    const dialog = page.locator('#mobile-navigation');
    expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    await dialog.locator('[data-mobile-disclosure="mobile-service-links"]').click();
    await expect(dialog.locator('[data-mobile-service="multifamily"]')).toBeVisible();
    expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    await dialog.locator('a[href="mailto:peter@pidesigngroup.ca"]').scrollIntoViewIfNeeded();
    const emailBounds = await dialog.locator('a[href="mailto:peter@pidesigngroup.ca"]').boundingBox();
    expect(emailBounds!.x + emailBounds!.width).toBeLessThanOrEqual(320);
    await page.keyboard.press('Escape');
    await expect(page.locator('.mobile-menu-button')).toBeFocused();
  });
});
