# Traceability Matrix

| Requirement ID | Description | Implementation Files | Test Coverage | Documentation Coverage | Status |
|---|---|---|---|---|---|
| REQ-AUTH-01 | Tenants can register via email | `app/auth/sign-up/page.tsx`, `schema.sql` | `TEST_PLAN.md` | `SECURITY.md` | Complete |
| REQ-AUTH-02 | Role-based login and redirection | `app/auth/login/page.tsx`, `middleware.ts` | `TEST_PLAN.md` | `SECURITY.md` | Complete |
| REQ-PROP-01 | Managers can create properties | `app/manager/properties/page.tsx` | `TEST_PLAN.md` | `api.md` | Complete |
| REQ-PROP-02 | Managers can create units | `app/manager/units/page.tsx` | `TEST_PLAN.md` | `api.md` | Complete |
| REQ-PROP-03 | Managers can assign tenants to units | `app/manager/tenants/page.tsx` | `TEST_PLAN.md` | `api.md` | Complete |
| REQ-MNT-01 | Tenants can submit maintenance requests | `app/tenant/request/new/page.tsx` | `TEST_PLAN.md` | `api.md` | Complete |
| REQ-MNT-02 | Tenants can attach images to requests | `app/tenant/request/new/page.tsx` | `TEST_PLAN.md` | `api.md` | Complete |
| REQ-MNT-03 | Managers can assign technicians | `app/manager/requests/page.tsx` | `TEST_PLAN.md` | `api.md` | Complete |
| REQ-MNT-04 | Technicians can update request status | `app/technician/assigned-requests/page.tsx` | `TEST_PLAN.md` | `api.md` | Complete |
| REQ-SEC-01 | Tenant data must be isolated | `supabase/schema.sql` (RLS) | `TEST_PLAN.md` | `SECURITY.md` | Complete |
| REQ-PERF-01 | Lighthouse Performance > 95 | Next.js App Router | Blocked | `ARCHITECTURE.md` | Partial |
