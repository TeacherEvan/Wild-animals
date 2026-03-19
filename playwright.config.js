const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:4187',
    headless: true
  },
  webServer: {
    command: 'python3 -m http.server 4187',
    port: 4187,
    reuseExistingServer: false,
    timeout: 30000
  }
});
