import { expect, test } from '@playwright/test';

test.describe('public site', () => {
  test('home renders the profile without drafts or TODO text', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'Sahil Bhatti' })).toBeVisible();
    await expect(page.getByText('I study how AI systems leak and break')).toBeVisible();
    const text = await page.locator('body').innerText();
    expect(text).not.toContain('TODO');
    // Bio is seeded unreviewed, so it must not render.
    expect(text).not.toContain('I hold an M.Tech');
    // The thesis project is a draft.
    expect(text).not.toContain('Encrypted Network Traffic Classification');
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
  });

  test('navigation reaches every section', async ({ page }) => {
    await page.goto('/');
    for (const [label, path, heading] of [
      ['Research', '/research', 'Research'],
      ['Reproductions', '/reproductions', 'Reproductions'],
      ['Notes', '/notes', 'Notes'],
      ['CV', '/cv', 'Curriculum Vitae'],
    ] as const) {
      await page
        .getByRole('navigation', { name: 'Main' })
        .getByRole('link', { name: label, exact: true })
        .click();
      await expect(page).toHaveURL(path);
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    }
    await page.getByRole('link', { name: 'Sahil Bhatti' }).first().click();
    await expect(page).toHaveURL('/');
  });

  test('dark mode toggle persists across reloads', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const html = page.locator('html');
    await page.getByTestId('theme-toggle').click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe('rgb(20, 20, 19)');
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await page.getByTestId('theme-toggle').click();
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('archived and draft content never appears publicly', async ({ page, request }) => {
    await page.goto('/notes');
    await expect(page.getByText('RAG without magic words')).toHaveCount(0);
    await page.goto('/research');
    await expect(page.getByText('LLM Gateway')).toHaveCount(0);
    await expect(page.getByText('Encrypted Network Traffic Classification')).toHaveCount(0);
    for (const path of [
      '/research/encrypted-traffic-classification',
      '/research/llm-gateway',
      '/notes/rag-without-magic',
    ]) {
      const res = await request.get(path);
      const body = await res.text();
      expect(body, path).toContain('This page does not exist');
      expect(body).not.toContain('TODO:');
    }
    const feed = await (await request.get('/feed.xml')).text();
    expect(feed).not.toContain('RAG without magic');
    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap).not.toContain('/admin');
    expect(sitemap).not.toContain('llm-gateway');
  });

  test('old /work URLs redirect or answer 410', async ({ request }) => {
    const work = await request.get('/work', { maxRedirects: 0 });
    expect(work.status()).toBe(308);
    expect(work.headers().location).toBe('/research');
    const thesis = await request.get('/work/encrypted-network-traffic-classification', {
      maxRedirects: 0,
    });
    expect(thesis.status()).toBe(308);
    expect(thesis.headers().location).toBe('/research/encrypted-traffic-classification');
    for (const path of [
      '/work/stride',
      '/work/llm-gateway',
      '/work/lazarus-engine',
      '/work/car-brand-classification',
      '/work/covid-19-detection-chest-xrays',
      '/hire',
      '/resume/ai-backend-engineer.pdf',
    ]) {
      expect((await request.get(path, { maxRedirects: 0 })).status(), path).toBe(410);
    }
  });

  test('security headers are present', async ({ request }) => {
    const res = await request.get('/');
    const h = res.headers();
    expect(h['content-security-policy']).toContain("object-src 'none'");
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['referrer-policy']).toBeTruthy();
    expect(h['permissions-policy']).toContain('camera=()');
    expect(h['strict-transport-security']).toContain('max-age=');
  });

  test('unknown pages use the custom 404', async ({ page }) => {
    await page.goto('/definitely-missing');
    await expect(page.getByText('This page does not exist.')).toBeVisible();
  });

  test('side projects are unlinked and noindexed', async ({ page, request }) => {
    await page.goto('/');
    await expect(page.locator('a[href*="trident"]')).toHaveCount(0);
    const res = await request.get('/trident/index.html');
    expect(res.headers()['x-robots-tag']).toContain('noindex');
  });
});
