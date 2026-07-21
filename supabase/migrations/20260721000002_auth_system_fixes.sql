-- Authentication and Role Provisioning Fixes

-- 1. Create a robust handle_new_user trigger that won't fail silently
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    requested_role TEXT;
    assigned_role user_role;
BEGIN
    requested_role := new.raw_user_meta_data->>'role';
    
    -- Safely parse the role, fallback to tenant
    IF requested_role = 'admin' THEN
        assigned_role := 'admin'::user_role;
    ELSIF requested_role = 'manager' THEN
        assigned_role := 'manager'::user_role;
    ELSIF requested_role = 'technician' THEN
        assigned_role := 'technician'::user_role;
    ELSE
        assigned_role := 'tenant'::user_role;
    END IF;

    -- Ensure we never insert nulls for full_name
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
        new.email,
        assigned_role
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- If we get an exception, we log it and fallback to a default row to prevent auth breakdown
    RAISE LOG 'Profile creation failed for %: %', new.id, SQLERRM;
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        new.id,
        'Fallback User',
        new.email,
        'tenant'::user_role
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
