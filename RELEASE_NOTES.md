# Release Notes

## Version: v1.0.0-rc.1
**Date:** 2026-07-19
**Status:** Release Candidate 1

### Overview
SMARTMAINTAIN RC1 represents a feature-complete state according to the initial System Requirements Specification. The application is production-ready pending final deployment verification and successful passing of the End-to-End Browser Verification suite, which is currently paused due to local environmental network constraints.

### Features Included
- **Authentication & RBAC:** Full Supabase Auth integration with secure server-side session management. Middleware routes users dynamically based on PostgreSQL row-level profiles.
- **Tenant Portal:** Tenants can register, access their dashboards, and submit new maintenance requests with categorized priority and image attachments via Supabase Storage.
- **Technician Portal:** Technicians receive a queue of assigned tasks and can update statuses securely, tracking timestamps (`completed_at`).
- **Manager Portal:** Complete oversight of Properties, Units, Tenants, and Maintenance Requests. Managers can create entities and assign users dynamically.
- **Security:** Hardened Row-Level Security (RLS) policies on all tables (`profiles`, `properties`, `units`, `maintenance_requests`, `attachments`) ensuring absolute tenant isolation and strict manager capabilities.

### Technical Achievements
- Zero TypeScript Errors (`next build` succeeds).
- Strict linting enabled (`next/core-web-vitals`).
- Documentation alignment (Architecture, SRS, API schemas, DB Schema).
- Playwright E2E suites authored and integrated (`npm run test:e2e`).

### Known Limitations
- The E2E tests have not been executed against a live Chrome instance locally due to network bandwidth constraints preventing the download of browser binaries. This will be unblocked in the CI/CD pipeline or when bandwidth improves.
- Refer to `KNOWN_LIMITATIONS.md` for broader application constraints (e.g., lack of real-time WebSocket notifications).

### Deployment
To deploy this Release Candidate:
1. Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are provisioned.
2. Ensure the Supabase Storage buckets `maintenance-images` and `profile-images` exist and are public.
3. Deploy to Vercel or any Next.js-compatible hosting platform.
