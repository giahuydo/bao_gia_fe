import { defineConfig } from '@playwright/test';
import path from 'path';

const STORAGE_STATE = path.join(__dirname, 'e2e/.auth/user.json');

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  retries: 0,
  use: {
    baseURL: 'http://localhost:4000',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
      testIgnore: /auth\.setup\.ts/,
    },
  ],
  reporter: [['html', { open: 'never' }]],
  webServer: {
    command: 'npm run dev',
    port: 4000,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
