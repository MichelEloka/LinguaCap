import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:5183';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: '50%',
  reporter: 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome'],
    ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
  },
  webServer: {
    command: 'npm run dev -- --port 5183 --strictPort',
    url: baseURL,
    reuseExistingServer: false,
    env: { VITE_LINGUACAP_MODE: 'demo' },
  },
});
