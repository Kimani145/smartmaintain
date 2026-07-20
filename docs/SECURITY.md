# Security Posture

## Authentication
- Handled exclusively by Supabase Auth.
- Passwords are encrypted by Supabase.
- JWT tokens are stored securely in HTTP-only cookies via Next.js Middleware (`lib/supabase/proxy.ts`).

## Authorization (Row-Level Security)
- All tables have RLS enabled.
- **Tenants** can only `SELECT`, `INSERT`, `UPDATE` rows where `tenant_id = auth.uid()`.
- **Technicians** can only `SELECT`, `UPDATE` maintenance requests where `assigned_to = auth.uid()`.
- **Managers/Admins** bypass standard tenant restrictions via the `role` enum check on their `profiles` row.

## Data Integrity
- Foreign Key constraints (`ON DELETE CASCADE`) prevent orphaned records.
- Enum constraints (`request_status`, `request_priority`) prevent invalid state transitions.
