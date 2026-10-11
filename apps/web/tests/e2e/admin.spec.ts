import { expect, test, type Page } from '@playwright/test';

/**
 * Public pages are revalidated on save; allow a few seconds for the
 * regenerated page to replace the cached one, reloading until it does.
 */
async function expectLive(page: Page, path: string, text: string) {
  await expect(async () => {
    await page.goto(path);
    await expect(page.getByText(text).first()).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 20_000 });
}

test.describe('admin access', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('unauthenticated visitors are sent to the login page', async ({ page, request }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.getByRole('button', { name: 'Continue with GitHub' })).toBeVisible();
    expect((await request.get('/api/admin/export')).status()).toBe(401);
    const res = await request.get('/admin/note');
    expect(res.url()).toContain('/admin/login');
  });

  test('a forged session cookie does not grant access', async ({ page, context }) => {
    await context.addCookies([
      { name: 'authjs.session-token', value: 'forged', url: 'http://localhost:3100' },
    ]);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test('cross-origin POSTs to admin are rejected', async ({ request }) => {
    const res = await request.post('/admin', {
      headers: { Origin: 'https://evil.example' },
      data: 'x',
    });
    expect(res.status()).toBe(403);
  });
});

test.describe('owner workflow', () => {
  test('create, publish, edit, restore and archive a note', async ({ page }) => {
    page.on('dialog', (dialog) => void dialog.accept());
    const title = `E2E note ${Date.now()}`;

    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByTestId('todo-list')).toContainText(
      'Encrypted Network Traffic Classification',
    );

    await page.goto('/admin/note');
    await page.getByRole('button', { name: '+ New note' }).click();
    await expect(page).toHaveURL(/\/admin\/note\/[0-9a-f-]{36}$/);

    await page.getByLabel('Title', { exact: true }).fill(title);
    const body = page.getByRole('textbox', { name: 'Body' });
    await body.fill('First version with math $E=mc^2$.\n\n| a | b |\n|---|---|\n| 1 | 2 |');
    await expect(page.locator('[aria-label="Body preview"] .katex').first()).toBeVisible({
      timeout: 15_000,
    });
    await page.keyboard.press('ControlOrMeta+s');
    await expect(page.getByTestId('save-status')).toContainText('Saved');

    await page.getByRole('button', { name: 'Publish' }).click();
    await expect(page.getByTestId('entry-status')).toHaveText('published');

    await expectLive(page, '/notes', title);
    await page.getByRole('link', { name: title }).click();
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
    await expect(page.locator('.katex').first()).toBeVisible();
    const publicPath = new URL(page.url()).pathname;

    // Edit, wait for autosave, then check the change is live.
    await page.goto('/admin/note');
    await page.getByRole('link', { name: title }).click();
    await page.getByRole('textbox', { name: 'Body' }).fill('Second version.');
    await expect(page.getByTestId('save-status')).toContainText('Saved', { timeout: 15_000 });
    const editorUrl = page.url();

    await expectLive(page, publicPath, 'Second version.');

    // Revision history: restore the first published version.
    await page.goto(`${editorUrl}/revisions`);
    const revisions = page.getByTestId('revision-list').locator('li');
    expect(await revisions.count()).toBeGreaterThanOrEqual(3);
    await page
      .getByTestId('revision-list')
      .locator('li', { hasText: 'published' })
      .getByRole('button', { name: 'restore' })
      .click();
    await expect(page).toHaveURL(editorUrl);
    await expect(page.getByRole('textbox', { name: 'Body' })).toHaveValue(/First version/);

    await expectLive(page, publicPath, 'First version with math');

    // Archive: disappears publicly.
    await page.goto(editorUrl);
    await page.getByRole('button', { name: 'Archive' }).click();
    await expect(page.getByTestId('entry-status')).toHaveText('archived');
    await expectLive(page, '/notes', 'Paper-reading notes');
    await expect(async () => {
      await page.goto('/notes');
      await expect(page.getByRole('link', { name: title })).toHaveCount(0, { timeout: 1_000 });
    }).toPass({ timeout: 20_000 });
    expect((await page.request.get(publicPath)).status()).not.toBe(200);
  });

  test('a thumbnail uploaded to a published project saves and shows publicly', async ({ page }) => {
    page.on('dialog', (dialog) => void dialog.accept());
    const title = `E2E project ${Date.now()}`;
    // 1x1 PNG
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    );

    await page.goto('/admin/project');
    await page.getByRole('button', { name: '+ New project' }).click();
    await expect(page).toHaveURL(/\/admin\/project\/[0-9a-f-]{36}$/);
    await page.getByLabel('Title', { exact: true }).fill(title);
    await page.getByLabel('Summary (3–4 sentences)').fill('A test project.');
    await page.getByLabel('Start month', { exact: true }).fill('2026-01');
    await page.keyboard.press('ControlOrMeta+s');
    await expect(page.getByTestId('save-status')).toContainText('Saved');
    await page.getByRole('button', { name: 'Publish' }).click();
    await expect(page.getByTestId('entry-status')).toHaveText('published');

    // Alt text is entered once, in the upload dialog.
    await page.getByRole('button', { name: 'upload new' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.locator('input[type="file"]').setInputFiles({
      name: 'thumb.png',
      mimeType: 'image/png',
      buffer: png,
    });
    await dialog.getByLabel('Alt text (required)').fill('E2E thumbnail');
    await dialog.getByRole('button', { name: 'Upload' }).click();
    await expect(page.getByLabel('Thumbnail alt text')).toHaveValue('E2E thumbnail');
    await page.keyboard.press('ControlOrMeta+s');
    await expect(page.getByTestId('save-status')).toContainText('Saved');

    await expect(async () => {
      await page.goto('/research');
      await expect(page.getByAltText('E2E thumbnail')).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 20_000 });
  });

  test('refuses to publish an entry that still contains TODO:', async ({ page }) => {
    page.on('dialog', (dialog) => void dialog.accept());
    await page.goto('/admin/project?status=draft');
    await page.getByRole('link', { name: 'Encrypted Network Traffic Classification' }).click();
    await page.getByRole('button', { name: 'Publish' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Cannot publish' })).toBeVisible();
    await expect(page.getByTestId('entry-status')).toHaveText('draft');
  });

  test('export downloads a zip', async ({ page }) => {
    const response = await page.request.get('/api/admin/export');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('application/zip');
  });
});
