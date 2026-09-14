import { test, expect } from '@playwright/test';

test('a project card arrives at its opening photograph with native motion or the browser fallback', async ({ page }) => {
  await page.addInitScript(() => {
    window.addEventListener('pagereveal', event => {
      const transition = (event as Event & { viewTransition?: { ready: Promise<void> } }).viewTransition;
      const report = (outcome: string) => sessionStorage.setItem('transition-review', JSON.stringify({
        path: location.pathname,
        outcome,
        name: document.querySelector<HTMLImageElement>('[data-primary-project]')?.style.viewTransitionName || '',
      }));
      if (!transition) { report('fallback'); return; }
      report('pending');
      // Chrome can omit or skip a native transition when a document is not
      // visible. Its ready promise distinguishes that from an animated frame.
      void transition.ready.then(() => report('animated'), () => report('fallback'));
    });
  });
  await page.goto('/');
  await page.locator('[data-project="crestmont-west"] a').click();
  await expect(page).toHaveURL(/\/crestmontwest\/?$/);
  await expect(page.locator('.primary-figure .gallery-link')).toHaveAttribute('data-gallery-index', '0');
  await expect(page.locator('[data-primary-project]')).toHaveAttribute('src', '/media/gallery/crestmont-west/1.webp');
  await expect.poll(() => page.evaluate(() => {
    const review = JSON.parse(sessionStorage.getItem('transition-review') || 'null');
    return review?.path === '/crestmontwest' ? review.outcome : 'pending';
  })).toMatch(/^(animated|fallback)$/);
  const review = await page.evaluate(() => ({
    ...JSON.parse(sessionStorage.getItem('transition-review') || 'null'),
    token: sessionStorage.getItem('pi-photo-transition'),
  }));
  expect(review.token).toBeNull();
  if (review.outcome === 'animated') expect(review.name).toBe('project-photo');
});

test('a matching opening image receives its transition identity and consumes the record', async ({ page }) => {
  await page.goto('/crestmontwest');
  const result = await page.evaluate(() => {
    sessionStorage.setItem('pi-photo-transition', JSON.stringify({ path: location.pathname, id: 'crestmont-west' }));
    const event = new Event('pagereveal');
    Object.defineProperty(event, 'viewTransition', { value: { finished: new Promise(() => {}), skipTransition() {} } });
    window.dispatchEvent(event);
    const image = document.querySelector<HTMLImageElement>('[data-primary-project]')!;
    return { source: image.getAttribute('src'), name: image.style.viewTransitionName, token: sessionStorage.getItem('pi-photo-transition') };
  });
  expect(result).toEqual({ source: '/media/gallery/crestmont-west/1.webp', name: 'project-photo', token: null });
});

test('a restored carousel image does not inherit the opening photograph identity', async ({ page }) => {
  await page.goto('/crestmontwest');
  await page.getByRole('button', { name: 'Next opening image', exact: true }).click();
  await expect(page.locator('.primary-figure .gallery-link')).toHaveAttribute('data-gallery-index', '1');
  // Reproduce the arrival state of a cached page without depending on whether
  // this browser run enables its back/forward cache.
  const result = await page.evaluate(() => {
    sessionStorage.setItem('pi-photo-transition', JSON.stringify({ path: location.pathname, id: 'crestmont-west' }));
    const event = new Event('pagereveal');
    Object.defineProperty(event, 'viewTransition', { value: { finished: new Promise(() => {}), skipTransition() {} } });
    window.dispatchEvent(event);
    const image = document.querySelector<HTMLImageElement>('[data-primary-project]')!;
    return { source: image.getAttribute('src'), name: image.style.viewTransitionName, token: sessionStorage.getItem('pi-photo-transition') };
  });
  expect(result).toEqual({ source: '/media/gallery/crestmont-west/2.webp', name: '', token: null });
});
