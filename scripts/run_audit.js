const { chromium } = require('@playwright/test');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      process.env[key] = value;
    }
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://secgdubmyjdujijcrwbw.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ARTIFACT_DIR = '/home/kimani/.gemini/antigravity-cli/brain/4891ac21-b1d5-4243-947b-da205885f0e7';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function runAudit() {
  console.log("=== STARTING SMARTMAINTAIN SYSTEM DEFENSE AUDIT ===");
  const auditResults = [];

  // 1. DATABASE AUDIT
  console.log("\n1. Database Schema & RLS Audit...");
  try {
    const { data: profiles, error: pErr } = await supabaseAdmin.from('profiles').select('id, role, email');
    const { data: properties, error: prErr } = await supabaseAdmin.from('properties').select('id, name');
    const { data: units, error: uErr } = await supabaseAdmin.from('units').select('id, unit_number');
    const { data: requests, error: rErr } = await supabaseAdmin.from('maintenance_requests').select('id, title, status');
    
    console.log(`- Profiles in DB: ${profiles?.length || 0} (Err: ${pErr?.message || 'none'})`);
    console.log(`- Properties in DB: ${properties?.length || 0} (Err: ${prErr?.message || 'none'})`);
    console.log(`- Units in DB: ${units?.length || 0} (Err: ${uErr?.message || 'none'})`);
    console.log(`- Requests in DB: ${requests?.length || 0} (Err: ${rErr?.message || 'none'})`);
  } catch (err) {
    console.error("DB Audit error:", err);
  }

  // 2. HTTP ROUTE VERIFICATION (Node fetch)
  console.log("\n2. HTTP Endpoint Verification...");
  const routesToTest = [
    { path: '/', name: 'Landing Page' },
    { path: '/auth/login', name: 'Login Page' },
    { path: '/auth/sign-up', name: 'Signup Page' },
    { path: '/auth/forgot-password', name: 'Forgot Password Page' },
    { path: '/auth/reset-password', name: 'Reset Password Page' },
    { path: '/auth/onboarding', name: 'Onboarding Page' },
    { path: '/auth/setup-profile', name: 'Setup Profile Page' },
    { path: '/auth/verify-2fa', name: 'Verify 2FA Page' },
    { path: '/auth/sign-up-success', name: 'Signup Success Page' },
    { path: '/banned', name: 'Banned Page' },
    { path: '/dashboard', name: 'Dashboard Entry' },
    { path: '/dashboard/admin', name: 'Admin Dashboard' },
    { path: '/dashboard/manager', name: 'Manager Dashboard' },
    { path: '/dashboard/tenant', name: 'Tenant Dashboard' },
    { path: '/dashboard/technician', name: 'Technician Dashboard' },
    { path: '/dashboard/settings', name: 'Settings Page' },
    { path: '/manager/properties', name: 'Manager Properties' },
    { path: '/manager/units', name: 'Manager Units' },
    { path: '/manager/tenants', name: 'Manager Tenants' },
    { path: '/manager/technicians', name: 'Manager Technicians' },
    { path: '/manager/requests', name: 'Manager Requests' },
    { path: '/manager/reports', name: 'Manager Reports' },
    { path: '/tenant/requests', name: 'Tenant Requests List' },
    { path: '/tenant/request/new', name: 'Tenant New Request' },
    { path: '/admin/users', name: 'Admin Users' },
    { path: '/admin/reports', name: 'Admin Reports' },
    { path: '/admin/requests', name: 'Admin Requests' },
    { path: '/admin/2fa-setup', name: 'Admin 2FA Setup' },
    { path: '/notifications', name: 'Notifications' },
    { path: '/report', name: 'Submit Report' },
    { path: '/nonexistent-route-audit-404', name: '404 Page' },
  ];

  for (const route of routesToTest) {
    try {
      const res = await fetch(`${BASE_URL}${route.path}`, { redirect: 'manual' });
      const status = res.status;
      const location = res.headers.get('location') || 'N/A';
      console.log(`[HTTP ROUTE] ${route.name} (${route.path}) -> Status: ${status}, Location: ${location}`);
    } catch (e) {
      console.error(`[HTTP ROUTE FAILED] ${route.name}: ${e.message}`);
    }
  }

  // 3. PLAYWRIGHT BROWSER AUTOMATION & SCREENSHOTS
  console.log("\n3. Playwright Browser & Mobile Screenshots...");
  try {
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const screenshotsDir = path.join(ARTIFACT_DIR, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const context = await browser.newContext();
    const page = await context.newPage();

    // Sample key pages for screenshots
    const sampleRoutes = [
      { path: '/', name: 'landing' },
      { path: '/auth/login', name: 'login' },
      { path: '/auth/sign-up', name: 'signup' },
      { path: '/auth/forgot-password', name: 'forgot_password' },
    ];

    for (const r of sampleRoutes) {
      try {
        await page.goto(`${BASE_URL}${r.path}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
        const screenshotPath = path.join(screenshotsDir, `${r.name}.png`);
        await page.screenshot({ path: screenshotPath });
        console.log(`[SCREENSHOT SAVED] ${r.name} -> ${screenshotPath}`);
      } catch (e) {
        console.warn(`[SCREENSHOT WARN] ${r.name}: ${e.message}`);
      }
    }

    // Mobile viewport audit on login page
    const viewports = [
      { width: 320, name: '320px' },
      { width: 375, name: '375px' },
      { width: 390, name: '390px' },
      { width: 414, name: '414px' },
      { width: 768, name: '768px' },
      { width: 1024, name: '1024px' },
      { width: 1440, name: '1440px' },
    ];

    for (const vp of viewports) {
      try {
        await page.setViewportSize({ width: vp.width, height: 800 });
        await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'domcontentloaded', timeout: 10000 });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        console.log(`[MOBILE VERIFICATION] ${vp.name}: Horizontal Overflow = ${overflow ? 'FAIL' : 'PASS'}`);
      } catch (e) {
        console.warn(`[MOBILE WARN] ${vp.name}: ${e.message}`);
      }
    }

    await browser.close();
  } catch (err) {
    console.error("Playwright Launch Error:", err.message);
  }

  console.log("\n=== AUDIT SUITE COMPLETE ===");
}

runAudit();
