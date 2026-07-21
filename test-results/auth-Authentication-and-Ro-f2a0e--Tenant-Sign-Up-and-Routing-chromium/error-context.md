# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication and Role Routing Verification >> Tenant Sign Up and Routing
- Location: tests/auth.spec.ts:10:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:3000/auth/sign-up", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Authentication and Role Routing Verification', () => {
  4  |   // Use a generated unique suffix to avoid collisions in parallel runs
  5  |   const uniqueId = Math.floor(Math.random() * 1000000);
  6  |   const testTenantEmail = `tenant_${uniqueId}@example.com`;
  7  |   const testManagerEmail = `manager_${uniqueId}@example.com`;
  8  |   const password = 'TestPassword123!';
  9  | 
  10 |   test('Tenant Sign Up and Routing', async ({ page }) => {
> 11 |     await page.goto('/auth/sign-up');
     |                ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  12 |     
  13 |     await page.fill('input[name="fullName"]', 'Test Tenant');
  14 |     await page.fill('input[name="email"]', testTenantEmail);
  15 |     await page.fill('input[name="password"]', password);
  16 |     await page.selectOption('select[name="role"]', 'tenant');
  17 |     
  18 |     await page.click('button[type="submit"]');
  19 | 
  20 |     // Wait for redirect to success or dashboard
  21 |     await page.waitForURL(/\/auth\/sign-up-success|\/dashboard/);
  22 |     
  23 |     // Note: If email confirmation is disabled, user is logged in automatically
  24 |     // The test assumes email confirmation is disabled for local dev, 
  25 |     // or we are just testing the route protection.
  26 |     
  27 |     // Attempt to access manager dashboard
  28 |     await page.goto('/dashboard/manager');
  29 |     // Expect to be redirected
  30 |     await expect(page).toHaveURL(/.*\/dashboard\/tenant|.*\/auth\/login/);
  31 |   });
  32 | 
  33 |   test('Manager Sign Up and Routing', async ({ page }) => {
  34 |     await page.goto('/auth/sign-up');
  35 |     
  36 |     await page.fill('input[name="fullName"]', 'Test Manager');
  37 |     await page.fill('input[name="email"]', testManagerEmail);
  38 |     await page.fill('input[name="password"]', password);
  39 |     await page.selectOption('select[name="role"]', 'manager');
  40 |     
  41 |     await page.click('button[type="submit"]');
  42 | 
  43 |     await page.waitForURL(/\/auth\/sign-up-success|\/dashboard/);
  44 |     
  45 |     // Attempt to access admin dashboard
  46 |     await page.goto('/dashboard/admin');
  47 |     // Expect to be redirected away from admin
  48 |     await expect(page).not.toHaveURL(/.*\/dashboard\/admin/);
  49 |   });
  50 |   
  51 |   test('Strict Edge Routing (Unauthorized Access)', async ({ page }) => {
  52 |     // Unauthenticated user attempting to access /dashboard
  53 |     const res = await page.goto('/dashboard/admin');
  54 |     await expect(page).toHaveURL(/.*\/auth\/login/);
  55 |   });
  56 | });
  57 | 
```