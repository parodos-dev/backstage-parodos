import fs from 'fs';
import { test as base } from '@playwright/test';

export const test = base.extend({
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
