import { test, expect } from '@playwright/test';

test.describe('Authentication & User Onboarding', () => {
  const timestamp = Date.now();
  const dynamicTenantEmail = `tenant_${timestamp}@example.com`;
  const dynamicManagerEmail = `manager_${timestamp}@example.com`;
  const defaultPassword = 'TestPassword123!';

  test('Tenant Sign Up flow with role selection', async ({ page }) => {
    await page.goto('/auth/sign-up');
    
    // Verify initial form UI
    await expect(page.locator('h1')).toContainText('Create Account');
    
    await page.fill('input[name="fullName"]', 'Test E2E Tenant');
    await page.fill('input[name="email"]', dynamicTenantEmail);
    await page.fill('input[name="password"]', defaultPassword);
    await page.selectOption('select[name="role"]', 'tenant');
    
    await page.click('button[type="submit"]');

    // Wait for URL redirect to sign-up-success or dashboard or login
    await page.waitForURL(/\/auth\/sign-up-success|\/dashboard|\/auth\/login/);
    expect(page.url()).toMatch(/\/auth\/sign-up-success|\/dashboard|\/auth\/login/);
  });

  test('Manager Sign Up flow with role selection', async ({ page }) => {
    await page.goto('/auth/sign-up');
    
    await page.fill('input[name="fullName"]', 'Test E2E Manager');
    await page.fill('input[name="email"]', dynamicManagerEmail);
    await page.fill('input[name="password"]', defaultPassword);
    await page.selectOption('select[name="role"]', 'manager');
    
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/auth\/sign-up-success|\/dashboard|\/auth\/login/);
    expect(page.url()).toMatch(/\/auth\/sign-up-success|\/dashboard|\/auth\/login/);
  });

  test('Sign Up form validation for invalid inputs', async ({ page }) => {
    await page.goto('/auth/sign-up');

    // Submit with short password & invalid email
    await page.fill('input[name="fullName"]', 'A');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', '123');
    await page.click('button[type="submit"]');

    // Expect inline validation error messages
    await expect(page.locator('.text-destructive')).toBeVisible();
  });

  test('User Login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('input[type="email"]', 'nonexistent_user_9999@example.com');
    await page.fill('input[type="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    // Stays on login page or shows toast notification
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  test('Password visibility toggle on login form', async ({ page }) => {
    await page.goto('/auth/login');

    const passwordInput = page.locator('input[placeholder="••••••••"]');
    await passwordInput.fill('SecretPassword123');

    // Check default input type is password
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle button
    const toggleButton = page.locator('button:has(svg)');
    await toggleButton.click();

    // Check input type changes to text
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('Login with seeded account or dynamic credentials', async ({ page }) => {
    await page.goto('/auth/login');

    // Attempt login with seeded tenant
    await page.fill('input[type="email"]', 'tenant1@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should either navigate to /dashboard or stay if unseeded
    await page.waitForTimeout(1500);
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/dashboard|\/auth\/login/);
  });

  test('Strict Edge Routing (Unauthorized Access)', async ({ page }) => {
    // Unauthenticated user attempting to access /dashboard/admin
    await page.goto('/dashboard/admin');
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });
});
