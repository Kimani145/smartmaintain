# System Architecture

## Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS & Shadcn UI
- **State Management**: React Hooks

## Backend & Database
- **BaaS**: Supabase
- **Database**: PostgreSQL
- **API**: PostgREST (Auto-generated from Postgres schema)
- **Authentication**: Supabase Auth (JWT)

## Data Flow
1. Client requests data via `supabase-js` client.
2. Supabase verifies JWT and applies RLS policies.
3. PostgreSQL returns filtered dataset.
