import { defineConfig } from '@playwright/test';
import path from 'path';

export const STORAGE_STATE = path.join(__dirname, 'playwright/.auth/user.json');

export default defineConfig({
  testDir: './tests',
  reporter: [['list'], ['html']],
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Run tests in files in parallel */
  fullyParallel: true,

  use: {
    baseURL: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    // run traces on the first retry of a failed test:q
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'setup',
      testMatch: '**/*.setup.ts',
    },
    {
      name: 'e2e tests logged in',
      testMatch: '**/*.spec.ts',
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: `mkdir -p playwright/.auth && yarn --cwd="../.." dev${
      process.env.CI ? ':e2e' : ''
    }`,
    port: 3000,
  },
});
