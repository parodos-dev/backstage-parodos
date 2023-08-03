import fs from 'fs';
import { test as base } from '@playwright/test';
import { STORAGE_STATE } from '../playwright.config';

export const test = base.extend({
  context: async ({ context }, use) => {
    const sessionStorage = JSON.parse(fs.readFileSync(STORAGE_STATE, 'utf-8'));

    await context.addInitScript(storage => {
      for (const [key, value] of Object.entries(JSON.parse(storage))) {
        // @ts-ignore
        window.sessionStorage.setItem(key, value);
      }
    }, sessionStorage);

    use(context);
  },
});
