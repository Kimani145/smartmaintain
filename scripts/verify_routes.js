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

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function verifyAll() {
  console.log("=================================================");
  console.log(" SMARTMAINTAIN ZERO-TRUST DEFENSE AUDIT RUNNER   ");
  console.log("=================================================\n");

  // 1. Database Audit
  console.log("1. DATABASE AUDIT");
  console.log("-----------------");
  const { data: profiles } = await supabaseAdmin.from('profiles').select('id, role, email');
  const { data: properties } = await supabaseAdmin.from('properties').select('id, name');
  const { data: units } = await supabaseAdmin.from('units').select('id, unit_number');
  const { data: requests } = await supabaseAdmin.from('maintenance_requests').select('id, title, status');
  const { data: connections } = await supabaseAdmin.from('tenant_connections').select('id, status');
  const { data: reports } = await supabaseAdmin.from('user_reports').select('id, status');

  console.log(`- Profiles: ${profiles?.length || 0}`);
  console.log(`- Properties: ${properties?.length || 0}`);
  console.log(`- Units: ${units?.length || 0}`);
  console.log(`- Maintenance Requests: ${requests?.length || 0}`);
  console.log(`- Tenant Connections: ${connections?.length || 0}`);
  console.log(`- User Moderation Reports: ${reports?.length || 0}`);

  console.log("\n2. ROUTE & ENDPOINT VERIFICATION");
  console.log("---------------------------------");

  const routes = [
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
    { path: '/dashboard', name: 'Dashboard Router' },
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
    { path: '/nonexistent-route-audit-404', name: '404 Page Test' },
  ];

  for (const r of routes) {
    try {
      const res = await fetch(`${BASE_URL}${r.path}`, { redirect: 'manual' });
      const status = res.status;
      const redirectLoc = res.headers.get('location') || '';
      console.log(`Route: ${r.path.padEnd(30)} -> Status: ${status} ${redirectLoc ? `(Redirect -> ${redirectLoc})` : ''}`);
    } catch (err) {
      console.error(`Route: ${r.path.padEnd(30)} -> ERROR: ${err.message}`);
    }
  }

  console.log("\n=================================================");
  console.log(" AUDIT RUN COMPLETED                             ");
  console.log("=================================================");
}

verifyAll();
