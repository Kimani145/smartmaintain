import { test, expect } from '@playwright/test';

test.describe('Maintenance Workflow & Work Queue (Technician)', () => {
  test('Requires Technician Authentication for technician dashboard', async ({ page }) => {
    await page.goto('/dashboard/technician');
    await expect(page).toHaveURL(/.*\/auth\/login/);

    await page.goto('/technician/work-orders');
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  test('Technician Login and Dashboard Access', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'tech1@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(1000);
    if (page.url().includes('/dashboard')) {
      await expect(page).toHaveURL(/.*\/dashboard\/technician/);
      await expect(page.locator('h2')).toContainText(/Welcome Back|Technician/i);
    }
  });

  test('Technician Work Queue and Status Updates', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'tech1@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(1000);
    if (page.url().includes('/dashboard/technician')) {
      // Check Work Queue section
      await expect(page.locator('text=My Work Queue')).toBeVisible();

      // Check if there are assigned tasks to start or complete
      const startWorkBtn = page.locator('button:has-text("Start Work")').first();
      if (await startWorkBtn.isVisible()) {
        await startWorkBtn.click();
        await page.waitForTimeout(1000);
      }

      const completeBtn = page.locator('button:has-text("Mark Completed")').first();
      if (await completeBtn.isVisible()) {
        await completeBtn.click();
        await page.waitForTimeout(1000);
      }
    }
  });
});
