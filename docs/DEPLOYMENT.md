# Deployment Guide

SMARTMAINTAIN is optimized for deployment on Vercel with a Supabase backend.

## Prerequisites
1. Vercel account linked to your Git repository.
2. Supabase project with production database.

## Vercel Deployment
1. Import the repository into Vercel.
2. Set Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Click **Deploy**.

## Supabase Production Checklist
1. Execute `schema.sql`.
2. Verify all RLS policies are active.
3. Ensure the `handle_new_user` Postgres trigger is functioning.
4. Set up Storage buckets (`maintenance-images`).
