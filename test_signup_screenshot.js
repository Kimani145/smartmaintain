const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/auth/sign-up');
  await page.fill('input[name="fullName"]', 'Test Tenant');
  await page.fill('input[name="email"]', 'tenant_test_123@example.com');
  await page.fill('input[name="password"]', 'TestPassword123!');
  await page.selectOption('select[name="role"]', 'tenant');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000); // Wait 3 seconds for any toast or error
  await page.screenshot({ path: 'signup_error.png' });
  await browser.close();
})();
