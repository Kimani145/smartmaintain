-- 1. Update existing technicians to admin (so enum cast doesn't fail)
UPDATE public.profiles SET role = 'admin' WHERE role = 'technician';

-- 1.5 Drop policies depending on role column
DROP POLICY IF EXISTS "Managers and admins can view all profiles." ON public.profiles;
DROP POLICY IF EXISTS "Managers and admins have full access to properties." ON public.properties;
DROP POLICY IF EXISTS "Managers and admins have full access to units." ON public.units;
DROP POLICY IF EXISTS "Managers and admins have full access to requests." ON public.maintenance_requests;

-- 2. Remove technician from user_role enum
ALTER TYPE public.user_role RENAME TO user_role_old;
CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'tenant');

ALTER TABLE public.profiles 
  ALTER COLUMN role DROP DEFAULT,
  ALTER COLUMN role SET DATA TYPE public.user_role 
  USING role::text::public.user_role;

ALTER TABLE public.profiles 
  ALTER COLUMN role SET DEFAULT 'tenant'::public.user_role;

-- Recreate policies
CREATE POLICY "Managers and admins can view all profiles."
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('manager', 'admin')
        )
    );

CREATE POLICY "Managers and admins have full access to properties."
    ON public.properties FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('manager', 'admin')
        )
    );

CREATE POLICY "Managers and admins have full access to units."
    ON public.units FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('manager', 'admin')
        )
    );

CREATE POLICY "Managers and admins have full access to requests."
    ON public.maintenance_requests FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('manager', 'admin')
        )
    );

-- Recreate trigger that references user_role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
        new.email,
        COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'tenant'::public.user_role)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TYPE public.user_role_old;

-- 3. Add ban fields to profiles
ALTER TABLE public.profiles
ADD COLUMN is_banned BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN ban_reason TEXT,
ADD COLUMN appeal_message TEXT;

-- 4. Create user_reports table
CREATE TYPE report_status AS ENUM ('pending', 'investigating', 'resolved', 'dismissed');

CREATE TABLE public.user_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reported_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    status report_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for user_reports
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

-- Reporters can view and create their own reports
CREATE POLICY "Users can create and view their own reports"
ON public.user_reports FOR ALL
USING ( reporter_id = auth.uid() );

-- Admins can view and update all reports
CREATE POLICY "Admins have full access to reports"
ON public.user_reports FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 5. Storage bucket for report-images
INSERT INTO storage.buckets (id, name, public) VALUES ('report-images', 'report-images', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access Reports"
ON storage.objects FOR SELECT
USING ( bucket_id = 'report-images' );

CREATE POLICY "Authenticated users can upload reports"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'report-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Users can update their own report images"
ON storage.objects FOR UPDATE
USING ( auth.uid() = owner )
WITH CHECK ( bucket_id = 'report-images' );

CREATE POLICY "Users can delete their own report images"
ON storage.objects FOR DELETE
USING ( auth.uid() = owner );
