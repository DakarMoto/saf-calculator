const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'tests/e2e',
  timeout: 30 * 1000,
  use: {
    headless: true,
  },
  webServer: {
    command: 'npx http-server -p 8080',
    port: 8080,
    reuseExistingServer: false,
  },
});
