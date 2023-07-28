import { expect } from '@playwright/test';
import { test } from './sessionStorage';

test.describe('/parodos', () => {
  test('should render projects page', async ({ page }) => {
    await page.goto(`/`);

    await expect(page.locator('[href*="/parodos"]')).toBeVisible();

    page.locator('[href*="/parodos"]').click();

    await page.waitForSelector('data-testid=header-title');

    expect(page.url()).toContain(`/parodos`);

    await page.getByRole('button', { name: 'Add new project' }).click();

    await page.waitForSelector('data-testid=create-project');
  });
});
