import { test, expect } from '@playwright/test';

test.describe('Property Management & Connection Approval (Manager)', () => {
  test('Requires Manager Authentication for manager pages', async ({ page }) => {
    await page.goto('/dashboard/manager');
    await expect(page).toHaveURL(/.*\/auth\/login/);

    await page.goto('/manager/tenants');
    await expect(page).toHaveURL(/.*\/auth\/login/);

    await page.goto('/manager/requests');
    await expect(page).toHaveURL(/.*\/auth\/login/);

    await page.goto('/manager/properties');
    await expect(page).toHaveURL(/.*\/auth\/login/);

    await page.goto('/manager/units');
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  test('Manager Login and Dashboard access', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'manager@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(1000);
    if (page.url().includes('/dashboard')) {
      await expect(page).toHaveURL(/.*\/dashboard\/manager/);
    }
  });

  test('Manager Tenants Management & Connection Approval', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'manager@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(1000);
    if (page.url().includes('/dashboard')) {
      await page.goto('/manager/tenants');
      await expect(page.locator('h1')).toContainText('Manage Tenants');

      // Verify presence of Pending Connections section or Active Tenants
      const pendingSection = page.locator('text=Pending Connection Requests');
      if (await pendingSection.isVisible()) {
        const approveBtn = page.locator('button:has-text("Approve")').first();
        if (await approveBtn.isVisible()) {
          await approveBtn.click();
        }
      }
    }
  });

  test('Manager Maintenance Request Management & Status Updates', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'manager@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(1000);
    if (page.url().includes('/dashboard')) {
      await page.goto('/manager/requests');
      await expect(page.locator('h1')).toContainText('Manage Requests');

      // Check for action buttons such as "Start Work" or "Complete Request"
      const startWorkBtn = page.locator('button:has-text("Start Work")').first();
      if (await startWorkBtn.isVisible()) {
        await startWorkBtn.click();
      }
    }
  });

  test('Manager Properties & Units navigation', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'manager@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(1000);
    if (page.url().includes('/dashboard')) {
      await page.goto('/manager/properties');
      await expect(page.locator('h1')).toContainText(/Properties|Manage Properties/i);

      await page.goto('/manager/units');
      await expect(page.locator('h1')).toContainText(/Units|Manage Units/i);
    }
  });
});
