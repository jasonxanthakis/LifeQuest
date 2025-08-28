import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './E2E',
  timeout: 60000,
  webServer: {
    command: 'node server.js',  // starts your API server
    port: 8000,
    reuseExistingServer: true,  // avoids restarting if already running
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
});
