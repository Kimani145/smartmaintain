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

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function runEvidenceCollector() {
  console.log("=== EMPIRICAL EVIDENCE COLLECTOR RUN ===");
  
  // 1. Database Tables & Row Counts Evidence
  console.log("\n--- DB SCHEMA EVIDENCE ---");
  const tables = ['profiles', 'properties', 'units', 'maintenance_requests', 'attachments', 'notifications', 'audit_logs', 'tenant_connections', 'user_reports'];
  const dbEvidence = {};

  for (const t of tables) {
    const { data, error, count } = await supabaseAdmin.from(t).select('*', { count: 'exact' }).limit(3);
    if (error) {
      dbEvidence[t] = { status: 'ERROR', error: error.message };
    } else {
      dbEvidence[t] = { status: 'EXISTS', count, sampleColumns: data[0] ? Object.keys(data[0]) : [] };
    }
  }
  console.log(JSON.stringify(dbEvidence, null, 2));

  // 2. Codebase File Verification Evidence
  console.log("\n--- FILE VERIFICATION EVIDENCE ---");
  const requiredFiles = [
    'app/auth/sign-up/page.tsx',
    'app/auth/login/page.tsx',
    'app/auth/forgot-password/page.tsx',
    'app/auth/reset-password/page.tsx',
    'app/auth/sign-up-success/page.tsx',
    'app/auth/verify-2fa/page.tsx',
    'app/auth/onboarding/page.tsx',
    'app/auth/setup-profile/page.tsx',
    'app/banned/page.tsx',
    'app/(app)/layout.tsx',
    'app/(app)/dashboard/page.tsx',
    'app/(app)/dashboard/admin/page.tsx',
    'app/(app)/dashboard/manager/page.tsx',
    'app/(app)/dashboard/tenant/page.tsx',
    'app/(app)/dashboard/technician/page.tsx',
    'app/(app)/dashboard/settings/page.tsx',
    'app/(app)/dashboard/settings/settings-form.tsx',
    'app/(app)/manager/properties/page.tsx',
    'app/(app)/manager/units/page.tsx',
    'app/(app)/manager/tenants/page.tsx',
    'app/(app)/manager/technicians/page.tsx',
    'app/(app)/manager/requests/page.tsx',
    'app/(app)/manager/reports/page.tsx',
    'app/(app)/tenant/requests/page.tsx',
    'app/(app)/tenant/request/new/page.tsx',
    'app/(app)/admin/users/page.tsx',
    'app/(app)/admin/reports/page.tsx',
    'app/(app)/admin/requests/page.tsx',
    'app/(app)/admin/2fa-setup/page.tsx',
    'app/(app)/notifications/page.tsx',
    'app/(app)/report/page.tsx',
    'app/(app)/technician/work-orders/page.tsx',
    'app/actions/auth.ts',
    'app/actions/manager.ts',
    'app/actions/technician.ts',
    'app/actions/tenant.ts',
    'app/actions/tenant_admin.ts',
    'lib/supabase/proxy.ts',
    'lib/profile.ts',
    'components/app-shell-navigation.tsx',
    'components/empty-state.tsx',
    'components/timeline.tsx',
    'components/theme-toggle.tsx',
    'supabase/schema.sql',
    'supabase/migrations/20260721000003_fix_rls_recursion.sql'
  ];

  const fileEvidence = {};
  for (const relPath of requiredFiles) {
    const fullPath = path.join(__dirname, '..', relPath);
    const exists = fs.existsSync(fullPath);
    fileEvidence[relPath] = {
      exists,
      sizeBytes: exists ? fs.statSync(fullPath).size : 0
    };
  }
  console.log(JSON.stringify(fileEvidence, null, 2));
}

runEvidenceCollector();
