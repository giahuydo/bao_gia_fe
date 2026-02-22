import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4000',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
  reporter: [['html', { open: 'never' }]],
  webServer: {
    command: 'npm run dev',
    port: 4000,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
