-- 20260721000003_fix_rls_recursion.sql

-- 1. Create a SECURITY DEFINER function to get the current user's role without triggering RLS.
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS public.user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 2. Drop the recursive policies
DROP POLICY IF EXISTS "Managers and admins can view all profiles." ON public.profiles;
DROP POLICY IF EXISTS "Managers and admins have full access to properties." ON public.properties;
DROP POLICY IF EXISTS "Managers and admins have full access to units." ON public.units;
DROP POLICY IF EXISTS "Managers and admins have full access to requests." ON public.maintenance_requests;
DROP POLICY IF EXISTS "Admins have full access to reports" ON public.user_reports;

-- 3. Recreate the policies using the new function
CREATE POLICY "Managers and admins can view all profiles."
    ON public.profiles FOR SELECT
    USING (
        public.get_auth_user_role() IN ('manager', 'admin')
    );

CREATE POLICY "Managers and admins have full access to properties."
    ON public.properties FOR ALL
    USING (
        public.get_auth_user_role() IN ('manager', 'admin')
    );

CREATE POLICY "Managers and admins have full access to units."
    ON public.units FOR ALL
    USING (
        public.get_auth_user_role() IN ('manager', 'admin')
    );

CREATE POLICY "Managers and admins have full access to requests."
    ON public.maintenance_requests FOR ALL
    USING (
        public.get_auth_user_role() IN ('manager', 'admin')
    );

CREATE POLICY "Admins have full access to reports"
    ON public.user_reports FOR ALL
    USING (
        public.get_auth_user_role() = 'admin'
    );
