# Troubleshooting Guide

## Deployment Issues
**Symptom**: `TypeError: Cannot read properties of undefined (reading 'session')`
**Resolution**: Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correctly set in the Vercel/Production environment variables.

## Database Errors
**Symptom**: Foreign Key Constraint Violation when creating a Maintenance Request.
**Resolution**: The Tenant creating the request must be assigned to an active Unit. Managers must assign the Tenant to a Unit via the `/manager/tenants` UI before the Tenant can submit a request.

**Symptom**: Cannot insert user during registration.
**Resolution**: Ensure the Postgres trigger `handle_new_user` has been created. The trigger expects `user_metadata.full_name` to be populated during the Supabase Auth sign-up call.

## Authentication Errors
**Symptom**: Redirect loop after login.
**Resolution**: The Next.js middleware is rejecting the session. Verify that the browser allows HTTP-only cookies and that the local development environment is running on `localhost` or a secure `https` context.
