import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: './tests', fullyParallel: false, workers: 1,
  use: { baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:4175', serviceWorkers: 'allow', trace: 'retain-on-failure' },
  projects: [{ name: 'mobile-chromium', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } }],
  webServer: { command: 'npm run preview -- --port 4175', url: process.env.E2E_BASE_URL || 'http://127.0.0.1:4175', reuseExistingServer: !process.env.CI },
})
