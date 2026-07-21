-- 20260721000004_rc2_schema.sql

-- 1. Add manager_code and manager_id to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS manager_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES public.profiles(id);

-- 2. Function to generate unique manager codes
CREATE OR REPLACE FUNCTION public.generate_manager_code(full_name text) RETURNS text AS $$
DECLARE
  base_code text;
  new_code text;
  counter integer := 0;
BEGIN
  base_code := UPPER(SUBSTRING(REGEXP_REPLACE(COALESCE(full_name, 'USER'), '[^a-zA-Z]', '', 'g') FROM 1 FOR 4));
  IF LENGTH(base_code) < 4 THEN
    base_code := RPAD(base_code, 4, 'X');
  END IF;

  LOOP
    new_code := base_code || '-' || LPAD((floor(random() * 1000))::text, 3, '0');
    
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE manager_code = new_code) THEN
      RETURN new_code;
    END IF;
    
    counter := counter + 1;
    IF counter > 1000 THEN
      RAISE EXCEPTION 'Could not generate unique manager code for %', full_name;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

-- 3. Trigger to auto-generate manager code
CREATE OR REPLACE FUNCTION public.set_manager_code() RETURNS trigger AS $$
BEGIN
  IF NEW.role = 'manager' AND (NEW.manager_code IS NULL OR NEW.manager_code = '') THEN
    NEW.manager_code := public.generate_manager_code(NEW.full_name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS ensure_manager_code ON public.profiles;
CREATE TRIGGER ensure_manager_code
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_manager_code();

-- Backfill existing managers
UPDATE public.profiles SET role = 'manager' WHERE role = 'manager' AND manager_code IS NULL;

-- 4. Tenant Connections Table
CREATE TYPE public.connection_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE IF NOT EXISTS public.tenant_connections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    manager_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status public.connection_status NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, manager_id)
);

ALTER TABLE public.tenant_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants can view their own connections" ON public.tenant_connections
FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "Managers can view connections to them" ON public.tenant_connections
FOR SELECT USING (manager_id = auth.uid());

CREATE POLICY "Tenants can create pending connections" ON public.tenant_connections
FOR INSERT WITH CHECK (tenant_id = auth.uid() AND status = 'pending');

CREATE POLICY "Managers can update their connections" ON public.tenant_connections
FOR UPDATE USING (manager_id = auth.uid());

-- 5. Maintenance Request Workflow Upgrade
CREATE TYPE public.request_status_new AS ENUM (
  'submitted', 
  'manager_reviewed', 
  'assigned', 
  'accepted', 
  'in_progress', 
  'completed', 
  'archived'
);

ALTER TABLE public.maintenance_requests
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status TYPE public.request_status_new
  USING (
    CASE status::text
      WHEN 'pending' THEN 'submitted'::public.request_status_new
      WHEN 'cancelled' THEN 'archived'::public.request_status_new
      WHEN 'rejected' THEN 'archived'::public.request_status_new
      ELSE status::text::public.request_status_new
    END
  );

ALTER TABLE public.maintenance_requests
  ALTER COLUMN status SET DEFAULT 'submitted'::public.request_status_new;

DROP TYPE public.request_status;
ALTER TYPE public.request_status_new RENAME TO request_status;
