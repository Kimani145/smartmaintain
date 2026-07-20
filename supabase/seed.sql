-- Create pgcrypto extension if not exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ 
DECLARE
    admin_id UUID := gen_random_uuid();
    manager_id UUID := gen_random_uuid();
    tech1_id UUID := gen_random_uuid();
    tech2_id UUID := gen_random_uuid();
    tenant1_id UUID := gen_random_uuid();
    tenant2_id UUID := gen_random_uuid();
    tenant3_id UUID := gen_random_uuid();
    tenant4_id UUID := gen_random_uuid();
    tenant5_id UUID := gen_random_uuid();

    prop1_id UUID := gen_random_uuid();
    prop2_id UUID := gen_random_uuid();

    unit1_id UUID := gen_random_uuid();
    unit2_id UUID := gen_random_uuid();
    unit3_id UUID := gen_random_uuid();
    unit4_id UUID := gen_random_uuid();
    unit5_id UUID := gen_random_uuid();
    unit6_id UUID := gen_random_uuid();
    unit7_id UUID := gen_random_uuid();
    unit8_id UUID := gen_random_uuid();
    unit9_id UUID := gen_random_uuid();
    unit10_id UUID := gen_random_uuid();
    unit11_id UUID := gen_random_uuid();
    unit12_id UUID := gen_random_uuid();

    req1_id UUID := gen_random_uuid();
    req2_id UUID := gen_random_uuid();
    req3_id UUID := gen_random_uuid();
    req4_id UUID := gen_random_uuid();
BEGIN

    -- 1. Insert into auth.users (This will trigger public.profiles creation)
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES 
    (admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name": "Admin User", "role": "admin"}', NOW(), NOW()),
    (manager_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'manager@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name": "Property Manager", "role": "manager"}', NOW(), NOW()),
    (tech1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tech1@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name": "John Technician", "role": "technician"}', NOW(), NOW()),
    (tech2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tech2@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name": "Jane Technician", "role": "technician"}', NOW(), NOW()),
    (tenant1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tenant1@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name": "Alice Tenant", "role": "tenant"}', NOW(), NOW()),
    (tenant2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tenant2@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name": "Bob Tenant", "role": "tenant"}', NOW(), NOW()),
    (tenant3_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tenant3@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name": "Charlie Tenant", "role": "tenant"}', NOW(), NOW()),
    (tenant4_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tenant4@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name": "Diana Tenant", "role": "tenant"}', NOW(), NOW()),
    (tenant5_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tenant5@example.com', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name": "Evan Tenant", "role": "tenant"}', NOW(), NOW());

    -- Wait for triggers (profiles populated implicitly)

    -- 2. Insert Properties
    INSERT INTO public.properties (id, name, location, description) VALUES
    (prop1_id, 'Sunset Apartments', '123 Sunset Blvd, Sunnyville', 'A beautiful complex with a pool.'),
    (prop2_id, 'Oakwood Residences', '456 Oak St, Woodland', 'Quiet neighborhood living.');

    -- 3. Insert Units
    INSERT INTO public.units (id, property_id, unit_number, floor, status, rent) VALUES
    (unit1_id, prop1_id, '101', '1', 'vacant', 1200.00),
    (unit2_id, prop1_id, '102', '1', 'vacant', 1250.00),
    (unit3_id, prop1_id, '201', '2', 'vacant', 1300.00),
    (unit4_id, prop1_id, '202', '2', 'vacant', 1300.00),
    (unit5_id, prop1_id, '301', '3', 'vacant', 1400.00),
    (unit6_id, prop1_id, '302', '3', 'vacant', 1450.00),
    (unit7_id, prop2_id, 'A1', '1', 'vacant', 900.00),
    (unit8_id, prop2_id, 'A2', '1', 'vacant', 950.00),
    (unit9_id, prop2_id, 'B1', '2', 'vacant', 1000.00),
    (unit10_id, prop2_id, 'B2', '2', 'vacant', 1000.00),
    (unit11_id, prop2_id, 'C1', '3', 'vacant', 1100.00),
    (unit12_id, prop2_id, 'C2', '3', 'vacant', 1150.00);

    -- 4. Assign Tenants to Units
    UPDATE public.units SET tenant_id = tenant1_id, status = 'occupied' WHERE id = unit1_id;
    UPDATE public.units SET tenant_id = tenant2_id, status = 'occupied' WHERE id = unit3_id;
    UPDATE public.units SET tenant_id = tenant3_id, status = 'occupied' WHERE id = unit7_id;
    UPDATE public.units SET tenant_id = tenant4_id, status = 'occupied' WHERE id = unit8_id;
    UPDATE public.units SET tenant_id = tenant5_id, status = 'occupied' WHERE id = unit11_id;

    -- 5. Insert Maintenance Requests
    INSERT INTO public.maintenance_requests (id, tenant_id, property_id, unit_id, title, description, category, priority, status, assigned_to) VALUES
    (req1_id, tenant1_id, prop1_id, unit1_id, 'Leaking Sink', 'The kitchen sink is leaking heavily.', 'Plumbing', 'high', 'pending', NULL),
    (req2_id, tenant2_id, prop1_id, unit3_id, 'AC Not Cooling', 'The living room AC is blowing warm air.', 'HVAC', 'medium', 'assigned', tech1_id),
    (req3_id, tenant3_id, prop2_id, unit7_id, 'Broken Outlet', 'The outlet near the window sparked and died.', 'Electrical', 'urgent', 'in_progress', tech2_id),
    (req4_id, tenant5_id, prop2_id, unit11_id, 'Paint Peeling', 'Bathroom ceiling paint is peeling.', 'General', 'low', 'completed', tech1_id);

    UPDATE public.maintenance_requests SET completed_at = NOW() WHERE id = req4_id;

    -- 6. Insert Attachments
    INSERT INTO public.attachments (request_id, url) VALUES
    (req1_id, 'https://example.com/leak1.jpg'),
    (req1_id, 'https://example.com/leak2.jpg'),
    (req2_id, 'https://example.com/ac.jpg');

    -- 7. Insert Notifications
    INSERT INTO public.notifications (user_id, title, message, read) VALUES
    (tenant1_id, 'Request Received', 'Your request for Leaking Sink has been received.', true),
    (tenant2_id, 'Technician Assigned', 'John Technician has been assigned to AC Not Cooling.', false),
    (tech1_id, 'New Assignment', 'You have been assigned a new request: AC Not Cooling', false),
    (tenant5_id, 'Request Completed', 'Your request Paint Peeling is marked as completed.', true);

END $$;
