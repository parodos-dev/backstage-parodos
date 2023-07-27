import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('textbox', { name: 'SOEID' }).fill('test');
  await page.getByRole('textbox', { name: 'Password' }).fill('test');
  await page.keyboard.press('Enter');

  await expect(page.locator('[href*="/parodos"]')).toBeVisible();

  await page.context().storageState({ path: authFile });
});
