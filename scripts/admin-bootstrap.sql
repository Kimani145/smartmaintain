-- ==========================================
-- SMARTMAINTAIN ADMIN BOOTSTRAP SCRIPT
-- ==========================================
-- Run this script in the Supabase SQL Editor
-- AFTER the target user has signed up.
-- ==========================================

-- Replace 'admin@example.com' with the email of the user you want to promote to Admin.
DO $$
DECLARE
    target_email TEXT := 'admin@example.com';
    target_id UUID;
BEGIN
    -- 1. Find the user ID based on email
    SELECT id INTO target_id FROM auth.users WHERE email = target_email;

    IF target_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found in auth.users', target_email;
    END IF;

    -- 2. Update the profile role to 'admin'
    UPDATE public.profiles 
    SET role = 'admin'::user_role 
    WHERE id = target_id;

    -- 3. Update the auth.users raw_user_meta_data to keep it synced
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
    WHERE id = target_id;

    RAISE NOTICE 'User % has been successfully promoted to Admin.', target_email;
END $$;
