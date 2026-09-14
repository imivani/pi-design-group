import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { projects, projectPath } from '../src/data/projects';

test('all project routes show their verified facts once, directly after the opening', async ({ page, request }) => {
  const pages = await Promise.all(projects.map(async project => ({
    project,
    response: await request.get(projectPath(project)),
  })));
  for (const { project, response } of pages) {
    expect(response.ok(), project.name).toBe(true);
    const information = await page.evaluate(html => {
      const document = new DOMParser().parseFromString(html, 'text/html');
      const section = document.querySelector('.project-specification')!;
      return {
        count: document.querySelectorAll('.project-specification').length,
        previous: section.previousElementSibling?.className,
        next: section.nextElementSibling?.id,
        title: section.querySelector('h2')?.textContent,
        facts: [...section.querySelectorAll('dl > div')].map(item => [
          item.querySelector('dt')?.textContent,
          item.querySelector('dd')?.textContent,
        ]),
        heroIdentity: document.querySelector('#project-opening-image')?.getAttribute('data-primary-project'),
      };
    }, await response.text());
    expect(information.count, project.name).toBe(1);
    expect(information.previous).toBe('project-opening frame');
    expect(information.next).toBe('gallery');
    expect(information.title).toBe(project.category === 'single-homes' ? 'Collection information' : 'Project information');
    expect(information.facts, project.name).toEqual([
      ['Project type', project.type],
      ...(project.location ? [['Location', project.location]] : []),
      ['Landscape design', 'Pi Design Group'],
      ...(project.credit ? [['Architecture', project.credit.replace(/^Architecture by /, '')]] : []),
    ]);
    expect(information.heroIdentity).toBe(project.id);
  }
});

test('compact facts and the dark next-project section stay aligned and readable at every size', async ({ page }) => {
  test.setTimeout(60000);
  await page.addInitScript(() => localStorage.setItem('pi-motion', 'off'));
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    await page.goto('/crestmontwest');
    const facts = page.locator('.project-specification');
    const next = page.locator('.next-project');
    await expect(facts.locator('dl > div')).toHaveCount(4);
    const layout = await page.evaluate(() => {
      const bounds = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
      const facts = bounds('.project-specification');
      const opening = bounds('.project-opening');
      const next = bounds('.next-project');
      const inner = bounds('.next-project-inner');
      const rows = [...document.querySelectorAll('.project-specification dl > div')].map(item => item.getBoundingClientRect().top);
      return {
        factRows: new Set(rows).size,
        factsHeight: facts.height,
        directlyBelow: Math.abs(facts.top - opening.bottom) < 1,
        aligned: facts.left === opening.left && inner.left === opening.left && inner.width === opening.width,
        fullWidth: next.left === 0 && next.width === bounds('main').width,
        background: getComputedStyle(document.querySelector('.next-project')!).backgroundColor,
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    expect(layout).toMatchObject({ factRows: width === 1440 ? 1 : 2, directlyBelow: true, aligned: true, fullWidth: true, background: 'rgb(27, 28, 29)', overflow: false });
    expect(layout.factsHeight).toBeLessThan(width === 1440 ? 200 : 250);
    await expect(next.getByRole('heading', { name: 'Arbour Lake' })).toBeAttached();
    await expect(next.locator('figcaption')).toHaveText('Rendering');
    const audit = await new AxeBuilder({ page }).include('.project-specification').include('.next-project').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(audit.violations.map(issue => ({ id: issue.id, nodes: issue.nodes.map(node => node.target) }))).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test('projects with fewer credits, drawings, and residential collections retain their content and navigation', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('pi-motion', 'off'));
  for (const [route, count] of [['/central', 3], ['/arbourlake', 2], ['/rona', 2], ['/homes', 2]] as const) {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto(route);
    await expect(page.locator('.project-specification dl > div')).toHaveCount(count);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('.primary-figure .gallery-link').click();
    await expect(page.locator('#image-viewer')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.primary-figure .gallery-link')).toBeFocused();
  }
  await expect(page.locator('#information-title')).toHaveText('Collection information');
  await page.locator('.next-project-link').click();
  await expect(page.locator('#project-title')).toHaveText('Misc. Residential Single Family');
  await expect(page.locator('#information-title')).toHaveText('Collection information');
});
