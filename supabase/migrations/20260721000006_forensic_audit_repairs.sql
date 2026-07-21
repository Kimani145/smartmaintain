-- Migration: Forensic Audit Repairs (Security, RLS, Indexes, Storage Limits)

-- 1. Security Fix for handle_new_user()
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
        new.email,
        'tenant'::public.user_role
    );
    RETURN NEW;
END;
$$;

-- 2. Security Fix for profiles RLS policies (prevent role self-elevation)
DROP POLICY IF EXISTS "Users can view and edit their own profiles." ON public.profiles;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile.') THEN
        CREATE POLICY "Users can view their own profile."
        ON public.profiles FOR SELECT
        TO authenticated
        USING (auth.uid() = id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update non-sensitive profile fields.') THEN
        CREATE POLICY "Users can update non-sensitive profile fields."
        ON public.profiles FOR UPDATE
        TO authenticated
        USING (auth.uid() = id)
        WITH CHECK (
          auth.uid() = id 
          AND role IS NOT DISTINCT FROM (SELECT role FROM public.profiles WHERE id = auth.uid())
          AND is_banned IS NOT DISTINCT FROM (SELECT is_banned FROM public.profiles WHERE id = auth.uid())
          AND manager_code IS NOT DISTINCT FROM (SELECT manager_code FROM public.profiles WHERE id = auth.uid())
        );
    END IF;
END $$;

-- 3. Multi-Tenant Property Isolation
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS manager_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Managers and admins have full access to properties." ON public.properties;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'properties' AND policyname = 'Managers can manage their own properties.') THEN
        CREATE POLICY "Managers can manage their own properties."
        ON public.properties FOR ALL
        TO authenticated
        USING (
          (get_auth_user_role() = 'admin'::user_role) OR
          (get_auth_user_role() = 'manager'::user_role AND (manager_id IS NULL OR manager_id = auth.uid()))
        );
    END IF;
END $$;

-- 4. Missing Performance Indexes
CREATE INDEX IF NOT EXISTS idx_attachments_request ON public.attachments(request_id);
CREATE INDEX IF NOT EXISTS idx_tenant_connections_manager ON public.tenant_connections(manager_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reporter ON public.user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported ON public.user_reports(reported_id);
CREATE INDEX IF NOT EXISTS idx_properties_manager ON public.properties(manager_id);

-- 5. Storage Security and Limits
UPDATE storage.buckets 
SET file_size_limit = 10485760, 
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'] 
WHERE id IN ('maintenance-images', 'profile-images', 'report-images');
