import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('our approach switches between plan and built work and opens questions', async ({ page }) => {
  await page.goto('/approach');
  await expect(page.locator('h1')).toHaveText('From the first site visit to construction.');
  // The hero opens on the plan and settles on the built courtyard; the switch reverses it.
  const hero = page.locator('#hero');
  await expect(hero).toHaveAttribute('data-hero-view', 'built');
  await expect(page.locator('#site-header')).toHaveAttribute('data-theme', 'dark');
  await hero.getByRole('button', { name: 'Plan' }).click();
  await expect(hero).toHaveAttribute('data-hero-view', 'plan');
  await expect(hero.locator('[data-hero-caption]')).toHaveText('Landscape plan · Crestmont West');
  await hero.getByRole('button', { name: 'Built' }).click();
  await expect(hero).toHaveAttribute('data-hero-view', 'built');
  await page.locator('.approach-steps a').first().click();
  await expect(page).toHaveURL(/#stage-1$/);
  const pair = page.locator('[data-pair]').first();
  await pair.scrollIntoViewIfNeeded();
  await expect(pair).toHaveAttribute('data-view', 'built');
  await pair.getByRole('button', { name: 'Plan' }).click();
  await expect(pair).toHaveAttribute('data-view', 'plan');
  await expect(pair.getByRole('button', { name: 'Plan' })).toHaveAttribute('aria-pressed', 'true');
  await expect(pair.locator('[data-layer="plan"]')).toBeVisible();
  const question = page.locator('.approach-question').first();
  await question.locator('summary').click();
  await expect(question).toHaveAttribute('open', '');
  await expect(question.locator('.approach-answer')).toBeVisible();
  await question.locator('summary').click();
  await expect(question).not.toHaveAttribute('open', '');
  const schema = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(schema.some(text => text.includes('"FAQPage"'))).toBe(true);
  const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(audit.violations.map(issue => ({ id: issue.id, nodes: issue.nodes.map(node => node.target) }))).toEqual([]);
});

test('menu, footer and breadcrumbs lead to the new pages', async ({ page }) => {
  await page.goto('/');
  await page.locator('.desktop-nav').getByRole('link', { name: 'Our Approach' }).click();
  await expect(page).toHaveURL(/\/approach$/);
  await page.goto('/services/commercial');
  const trail = page.getByRole('navigation', { name: 'Breadcrumb' });
  await expect(trail).toContainText('Home');
  await expect(trail.locator('[aria-current="page"]')).toHaveText('Commercial Plazas');
  await trail.getByRole('link', { name: 'Services' }).click();
  await expect(page).toHaveURL(/\/services$/);
  await page.locator('.footer-privacy').click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.locator('h1')).toHaveText('Privacy');
});

test('project pages offer similar work and the matching service', async ({ page }) => {
  await page.goto('/seton');
  const similar = page.locator('.project-similar');
  await expect(similar.getByRole('heading', { name: 'More like this' })).toBeVisible();
  await expect(similar.getByRole('link', { name: 'Commercial Plazas' })).toHaveAttribute('href', '/services/commercial');
  await expect(similar.locator('.project-similar-grid li')).toHaveCount(2);
  await page.goto('/crestmontwest');
  await expect(page.locator('.project-similar-grid li')).toHaveCount(3);
  await expect(page.locator('.project-similar-head')).toContainText('Play & Open Spaces');
});

test('home shows practice figures and the architects credited on projects', async ({ page }) => {
  await page.goto('/');
  await page.locator('.practice-facts-strip').scrollIntoViewIfNeeded();
  await expect(page.locator('.practice-facts-strip > div')).toHaveCount(4);
  await expect.poll(() => page.locator('.practice-facts-strip [data-count="70"]').textContent()).toBe('70');
  // Architects appear as logos once supplied, otherwise as wordmarks; the band repeats for its scroll.
  await expect(page.locator('.practice-logo-track').first().locator('.practice-logo')).toHaveCount(5);
  await expect(page.locator('.practice-logo-track').first().locator('.practice-logo').first()).toContainText('Gravity');
  await expect(page.locator('.practice-logo-track').nth(1)).toHaveAttribute('aria-hidden', 'true');
});

test('optional contact details are sent with the inquiry', async ({ page }) => {
  // The sending service is replaced in the browser. No email is sent by this test.
  let payload: Record<string, string> = {};
  await page.route('**/api/contact', async route => { payload = route.request().postDataJSON(); await route.fulfill({ json: { ok: true } }); });
  await page.goto('/contact?type=parks');
  await expect(page.getByRole('radio', { name: 'Play & Open Spaces', exact: true })).toBeChecked();
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Test Visitor');
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('visitor@example.com');
  await page.getByRole('textbox', { name: 'Project location', exact: true }).fill('Calgary');
  await page.getByRole('combobox', { name: /Project stage/ }).selectOption('Concept design');
  await page.getByRole('combobox', { name: /Timeline/ }).selectOption('Within 3 months');
  await page.getByRole('textbox', { name: 'Tell us about the project', exact: true }).fill('A play area between the homes.');
  await page.getByRole('button', { name: 'Send Inquiry' }).click();
  await expect(page.locator('#inquiry-sent')).toBeVisible();
  expect(payload).toMatchObject({ projectType: 'Play & Open Spaces', stage: 'Concept design', timeline: 'Within 3 months' });
});
