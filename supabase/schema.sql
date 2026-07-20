-- 1. Create Enums and Types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'tenant', 'technician');
CREATE TYPE request_status AS ENUM ('pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'rejected');
CREATE TYPE request_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- 2. Create Profiles Table (Linked to Supabase Auth)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'tenant',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Properties Table
CREATE TABLE public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create Units Table
CREATE TABLE public.units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    unit_number TEXT NOT NULL,
    floor TEXT,
    status TEXT NOT NULL DEFAULT 'vacant',
    rent DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(property_id, unit_number)
);

-- 5. Create Maintenance Requests Table
CREATE TABLE public.maintenance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    priority request_priority NOT NULL DEFAULT 'medium',
    status request_status NOT NULL DEFAULT 'pending',
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 6. Create Attachments Table
CREATE TABLE public.attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.maintenance_requests(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Create Notifications Table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Create Audit Logs Table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID NOT NULL,
    changes JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Create Indexes for Query Performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_units_tenant ON public.units(tenant_id);
CREATE INDEX idx_requests_tenant ON public.maintenance_requests(tenant_id);
CREATE INDEX idx_requests_status ON public.maintenance_requests(status);
CREATE INDEX idx_requests_priority ON public.maintenance_requests(priority);
CREATE INDEX idx_requests_property ON public.maintenance_requests(property_id);
CREATE INDEX idx_requests_assigned ON public.maintenance_requests(assigned_to);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id) WHERE read = FALSE;

-- 10. Automatically Create Profile Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
        new.email,
        COALESCE((new.raw_user_meta_data->>'role')::user_role, 'tenant'::user_role)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 12. Define RLS Policies

-- Profiles
CREATE POLICY "Users can view and edit their own profiles."
    ON public.profiles FOR ALL
    USING (auth.uid() = id);

CREATE POLICY "Managers and admins can view all profiles."
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('manager', 'admin')
        )
    );

-- Properties & Units
CREATE POLICY "Tenants can view properties they occupy."
    ON public.properties FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.units
            WHERE units.property_id = properties.id AND units.tenant_id = auth.uid()
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

CREATE POLICY "Tenants can view units they occupy."
    ON public.units FOR SELECT
    USING (tenant_id = auth.uid());

CREATE POLICY "Managers and admins have full access to units."
    ON public.units FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('manager', 'admin')
        )
    );

-- Maintenance Requests
CREATE POLICY "Tenants can manage their own requests."
    ON public.maintenance_requests FOR ALL
    USING (tenant_id = auth.uid());

CREATE POLICY "Technicians can view and update assigned requests."
    ON public.maintenance_requests FOR SELECT
    USING (assigned_to = auth.uid());

CREATE POLICY "Technicians can update status of assigned requests."
    ON public.maintenance_requests FOR UPDATE
    USING (assigned_to = auth.uid())
    WITH CHECK (assigned_to = auth.uid());

CREATE POLICY "Managers and admins have full access to requests."
    ON public.maintenance_requests FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('manager', 'admin')
        )
    );

-- Attachments
CREATE POLICY "Users can view attachments linked to accessible requests."
    ON public.attachments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.maintenance_requests
            WHERE id = attachments.request_id
        )
    );

CREATE POLICY "Users can insert attachments."
    ON public.attachments FOR INSERT
    WITH CHECK (TRUE);

-- Notifications
CREATE POLICY "Users can manage their own notifications."
    ON public.notifications FOR ALL
    USING (user_id = auth.uid());

-- Storage Buckets (Run in Supabase Console)
-- Note: Create buckets 'maintenance-images' and 'profile-images' manually or via API.