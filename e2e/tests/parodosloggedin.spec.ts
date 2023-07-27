import { test, expect } from '@playwright/test';

test.describe('/parodos', () => {
  test('should render projects page', async ({ page }) => {
    await page.goto(`/`);

    await page.getByRole('textbox', { name: 'SOEID' }).fill('test');
    await page.getByRole('textbox', { name: 'Password' }).fill('test');
    await page.keyboard.press('Enter');

    await expect(page.locator('[href*="/parodos"]')).toBeVisible();

    page.locator('[href*="/parodos"]').click();

    await page.waitForSelector('data-testid=header-title');

    expect(page.url()).toContain(`/parodos`);

    await page.getByRole('button', { name: 'Add new project' }).click();

    await page.waitForSelector('data-testid=create-project');
  });
});
