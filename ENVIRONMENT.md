# Environment Configuration

The following environment variables are required for SMARTMAINTAIN to function:

### Frontend (.env.local)

```env
# Required: Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co

# Required: Supabase Anon Key (Public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Optional: Disable Supabase telemetry
NEXT_TELEMETRY_DISABLED=1
```

### Database Context

Ensure the following buckets exist in the Supabase Storage dashboard:
- `maintenance-images` (Public)
- `profile-images` (Public)

Ensure Email Confirmations are toggled to your preference in the Supabase Auth Settings.
