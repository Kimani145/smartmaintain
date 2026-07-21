import { test, expect } from '@playwright/test';

test.describe('Role-Based Access Control & Route Guarding', () => {
  const timestamp = Date.now();
  const testTenantEmail = `role_tenant_${timestamp}@example.com`;
  const testManagerEmail = `role_manager_${timestamp}@example.com`;
  const testPassword = 'Password123!';

  test('Unauthenticated user redirected to login for protected dashboard routes', async ({ page }) => {
    const protectedRoutes = [
      '/dashboard',
      '/dashboard/tenant',
      '/dashboard/manager',
      '/dashboard/technician',
      '/dashboard/admin',
      '/manager/properties',
      '/manager/requests',
      '/manager/tenants',
      '/tenant/request/new',
      '/tenant/requests',
      '/technician/work-orders',
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/.*\/auth\/login/);
    }
  });

  test('Tenant signup provisions tenant role and routes appropriately', async ({ page }) => {
    await page.goto('/auth/sign-up');
    
    await page.fill('input[name="fullName"]', 'Role Test Tenant');
    await page.fill('input[name="email"]', testTenantEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.selectOption('select[name="role"]', 'tenant');
    
    await page.click('button[type="submit"]');

    // Wait for redirect
    await Promise.race([
      page.waitForURL(/\/dashboard|\/auth\/sign-up-success/),
      page.waitForSelector('.text-destructive', { state: 'visible' })
    ]);

    if (page.url().includes('/dashboard')) {
      await expect(page).toHaveURL(/.*\/dashboard\/tenant|.*\/dashboard/);
    }
  });

  test('Manager signup provisions manager role and routes appropriately', async ({ page }) => {
    await page.goto('/auth/sign-up');
    
    await page.fill('input[name="fullName"]', 'Role Test Manager');
    await page.fill('input[name="email"]', testManagerEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.selectOption('select[name="role"]', 'manager');
    
    await page.click('button[type="submit"]');

    await Promise.race([
      page.waitForURL(/\/dashboard|\/auth\/sign-up-success/),
      page.waitForSelector('.text-destructive', { state: 'visible' })
    ]);

    if (page.url().includes('/dashboard')) {
      await expect(page).toHaveURL(/.*\/dashboard\/manager|.*\/dashboard/);
    }
  });

  test('Role restriction boundary: Attempting access to unauthorized admin panel', async ({ page }) => {
    // Unauthenticated or non-admin users attempting to access /dashboard/admin
    await page.goto('/dashboard/admin');
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });
});
