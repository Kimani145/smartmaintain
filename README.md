# SMARTMAINTAIN

**SMARTMAINTAIN** is an enterprise-grade, multi-role property maintenance and management system. Designed for high information density, resilience, and operational efficiency, it streamlines the lifecycle of maintenance requests, tenant tracking, and unit management while enforcing strict access controls and robust moderation.

---

## 🎯 Core Features

### 1. Multi-Role Architecture & Workflows
The system operates on three primary roles, strictly enforced via Supabase Row Level Security (RLS):

- **Tenants**: Can view their assigned property/unit, submit maintenance requests with image attachments, track request progress, and report inappropriate behavior.
- **Managers**: Command centers for property oversight. Managers oversee multiple properties and units, onboard tenants, assign tenants to units, and actively track/update the lifecycle of maintenance requests (`pending`, `in_progress`, `completed`).
- **Administrators**: System-wide global oversight. Admins manage the user base, oversee telemetry and usage reports, enforce disciplinary actions (bans), and process user reports. Admins are protected by mandatory Multi-Factor Authentication (MFA).

### 2. High-Density Operational UX
- **Dashboard Command Centers**: Dashboards are built for immediate operational awareness. They display critical KPIs (Total Units, Pending Requests, Active Bans), recent activities, and quick actions, keeping users focused on what needs attention.
- **Restrained Semantic Design**: Built on `shadcn/ui`, the interface avoids heavy gradients or glassmorphism in favor of a clean, predictable, semantic layout (e.g., specific color badges for request statuses).
- **Comprehensive Error Handling**: The application globally captures routing errors, 404s, and data fetching failures, replacing stack traces or raw SQL logs with friendly UI fallbacks (`error.tsx`, `not-found.tsx`, `Skeletons`, and `sonner` Toasts).

### 3. Security, Moderation, & Resilience
- **Robust Authentication**: Powered by Supabase Auth with server-side cookies. 
- **MFA Enforcement**: Administrative accounts are forced through a TOTP 2FA setup and verification flow (`aal1` to `aal2` step-up authentication).
- **User Moderation & Bans**: Global interceptors block banned users from accessing protected routes, redirecting them to a centralized Appeals page.
- **Strict Row-Level Security**: No tenant can access another tenant's requests or property details. Direct Postgres policies enforce this at the database layer.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React 19)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix Primitives, class-variance-authority)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, GoTrue, Storage)
- **Package Manager**: [pnpm](https://pnpm.io/)

---

## 🗄️ Data Model Overview

| Table | Purpose |
|---|---|
| `profiles` | Extends Supabase `auth.users`. Stores role, full name, and moderation status (`is_banned`, `ban_reason`). |
| `properties` | Represents a physical building/complex, assigned to a specific `manager_id`. |
| `units` | Specific apartments/rooms within a property, optionally assigned to a `tenant_id`. |
| `maintenance_requests` | Core operational unit. Tracks issues from submission to completion. |
| `attachments` | Links Supabase Storage bucket image URLs to specific maintenance requests. |
| `notifications` | In-app alerts for state changes (e.g., status updates). |
| `user_reports` | Moderation queue for users reporting other users' behavior. |

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js (v20+)
- `pnpm` (Strictly enforced package manager)
- A Supabase Project (Local CLI or Cloud)

### 2. Environment Variables
Copy `.env.example` to `.env.local` and populate the required Supabase keys:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Initialization
Ensure your Supabase instance is running, then apply the schema, storage buckets, and initial RLS policies. The database should be reconstructed entirely from the `supabase/migrations/` directory.

```bash
supabase start
supabase migration up
```

*(If applying to a cloud project, run `supabase db push`)*

### 4. Install & Run
Install dependencies strictly via `pnpm`:

```bash
pnpm install
pnpm dev
```

The application will be available at `http://localhost:3000`.

---

## 🧪 Testing

The repository uses Playwright for End-to-End (E2E) testing. E2E tests are strictly typed and ensure core flows (Authentication, Roles, Bans, Form Validation) execute flawlessly.

```bash
pnpm test:e2e       # Run headless
pnpm test:e2e:ui    # Run with Playwright UI
```

---

## 📚 Documentation Reference

For deeper implementation details, consult the following artifacts:

- **[Installation Guide](docs/INSTALL.md)**: Extended setup and troubleshooting.
- **[Deployment Guide](docs/DEPLOYMENT.md)**: CI/CD, environment management, and production builds.
- **[Architecture](docs/ARCHITECTURE.md)**: Detailed breakdown of the App Router structure, Server Actions, and component hierarchy.
- **[Security](docs/SECURITY.md)**: Explanation of the RLS policies, MFA implementation, and global middleware interceptors.
- **[Database ERD](docs/database/ERD.md)**: Entity Relationship Diagram mapping all foreign keys and triggers.
- **[Dictionary](docs/database/DICTIONARY.md)**: Definitions for all database schemas, enums, and JSON structures.
