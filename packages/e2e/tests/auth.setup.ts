import { test as setup, expect } from '@playwright/test';
import fs from 'fs';
import { STORAGE_STATE } from '../playwright.config';

setup('authenticate', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('textbox', { name: 'SOEID' }).fill('test');
  await page.getByRole('textbox', { name: 'Password' }).fill('test');
  await page.keyboard.press('Enter');

  await expect(page.locator('[href*="/parodos"]')).toBeVisible();

  const sessionStorage = await page.evaluate(() =>
    JSON.stringify(sessionStorage),
  );

  if (!process.env.CI) {
    fs.writeFileSync(STORAGE_STATE, JSON.stringify(sessionStorage), 'utf-8');
  }
});
