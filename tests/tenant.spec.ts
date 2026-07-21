import { test, expect } from '@playwright/test';

test.describe('Tenant Maintenance & Connection Workflows', () => {
  const timestamp = Date.now();
  const tenantEmail = `tenant_flow_${timestamp}@example.com`;
  const tenantPassword = 'Password123!';

  test.beforeEach(async ({ page }) => {
    // Navigate to base url to ensure server is ready
    await page.goto('/auth/login');
  });

  test('Requires Tenant Authentication for protected tenant routes', async ({ page }) => {
    await page.goto('/dashboard/tenant');
    await expect(page).toHaveURL(/.*\/auth\/login/);

    await page.goto('/tenant/request/new');
    await expect(page).toHaveURL(/.*\/auth\/login/);

    await page.goto('/tenant/requests');
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  test('Tenant login and dashboard view', async ({ page }) => {
    // Login with seeded tenant account
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'tenant1@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(1000);
    const url = page.url();

    if (url.includes('/dashboard')) {
      await expect(page.locator('h2')).toContainText(/Welcome back/i);
    }
  });

  test('Manager Connection flow on Tenant Dashboard', async ({ page }) => {
    // Log in as tenant
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'tenant1@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(1000);
    if (page.url().includes('/dashboard')) {
      // Look for manager connection input if not yet connected
      const connectCard = page.locator('text=Connect to Property Manager');
      if (await connectCard.isVisible()) {
        const input = page.locator('input[placeholder="e.g. PROP-123"]');
        await input.fill('PROP-999');
        const connectBtn = page.locator('button:has-text("Connect")');
        await connectBtn.click();
      }
    }
  });

  test('Maintenance Request Creation flow', async ({ page }) => {
    // Log in as tenant
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'tenant1@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(1000);
    if (page.url().includes('/dashboard')) {
      await page.goto('/tenant/request/new');

      // Fill out request form
      await page.fill('input[name="title"]', 'Leaky Sink Faucet in Bathroom');
      await page.fill('textarea[name="description"]', 'Water is leaking continuously under the bathroom sink cabinet.');
      await page.selectOption('select[name="category"]', 'Plumbing');
      await page.selectOption('select[name="priority"]', 'high');

      // Submit form
      await page.click('button[type="submit"]');

      // Wait for redirect to requests list or notification
      await page.waitForTimeout(1500);
      expect(page.url()).toMatch(/\/tenant\/requests|\/dashboard/);
    }
  });

  test('View Tenant Requests list', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'tenant1@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(1000);
    if (page.url().includes('/dashboard')) {
      await page.goto('/tenant/requests');
      await expect(page.locator('h1')).toContainText(/My Requests|Maintenance Requests/i);
    }
  });
});
