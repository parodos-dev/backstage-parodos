import { test as setup, expect } from '@playwright/test';
import fs from 'fs';
import { STORAGE_STATE } from '../playwright.config';

setup.extend({
  context: async ({ context }, use) => {
    const sessionStorage = JSON.parse(
      fs.readFileSync('playwright/.auth/user.json', 'utf-8'),
    );

    await context.addInitScript(storage => {
      console.log(storage);
      for (const [key, value] of Object.entries(JSON.parse(storage))) {
        // @ts-ignore
        window.sessionStorage.setItem(key, value);
      }
    }, sessionStorage);

    use(context);
  },
});

setup('authenticate', async ({ page, context }) => {
  await page.goto('/');
  await page.getByRole('textbox', { name: 'SOEID' }).fill('test');
  await page.getByRole('textbox', { name: 'Password' }).fill('test');
  await page.keyboard.press('Enter');

  await expect(page.locator('[href*="/parodos"]')).toBeVisible();

  const sessionStorage = await page.evaluate(() =>
    JSON.stringify(sessionStorage),
  );

  fs.writeFileSync(STORAGE_STATE, JSON.stringify(sessionStorage), 'utf-8');
});
