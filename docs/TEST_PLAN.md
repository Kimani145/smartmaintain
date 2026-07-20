# Acceptance Test Plan: Release Candidate v1.0

This test plan defines the criteria for validating the production-readiness of SMARTMAINTAIN. All tests correspond directly to the implemented system schema and frontend components.

---

## 1. Authentication & Role Provisioning

### Feature: User Registration (Tenant)
- **Preconditions**: No active session. Supabase Auth is active.
- **Steps**:
  1. Navigate to `/auth/sign-up`.
  2. Enter valid Email, Password, and Full Name.
  3. Submit the form.
- **Expected Result**: User is created in Supabase Auth. The Postgres trigger `handle_new_user` successfully creates a row in `public.profiles` with `role = 'tenant'` and the provided `full_name`. User is redirected to `/auth/sign-up-success`.
- **Pass/Fail**: [ ]
- **Evidence**: Database row in `public.profiles`.

### Feature: Role-Based Dashboard Redirection
- **Preconditions**: Users of different roles (tenant, technician, manager, admin) exist in `public.profiles`.
- **Steps**:
  1. Navigate to `/auth/login`.
  2. Authenticate as a specific role.
  3. Next.js middleware and `app/dashboard/page.tsx` process the session.
- **Expected Result**: User is automatically routed to their role-specific dashboard (e.g., `/dashboard/tenant`, `/dashboard/manager`). Unauthorized access to other dashboards is blocked.
- **Pass/Fail**: [ ]
- **Evidence**: URL changes correctly; UI renders role-specific components.

---

## 2. Property Management (Manager)

### Feature: Create New Property
- **Preconditions**: Logged in as Manager.
- **Steps**:
  1. Navigate to `/manager/properties`.
  2. Fill out Name, Location, and Description.
  3. Click "Add Property".
- **Expected Result**: Property is saved to `public.properties`. The UI updates optimisticially or re-fetches to display the new property.
- **Pass/Fail**: [ ]
- **Evidence**: Network payload (201 Created); Database row.

### Feature: Create Unit and Assign Tenant
- **Preconditions**: Logged in as Manager. At least one Property and one Tenant exist.
- **Steps**:
  1. Navigate to `/manager/units` and create a Unit under a Property.
  2. Navigate to `/manager/tenants`.
  3. Select a tenant and assign them to the newly created Unit via the dropdown.
- **Expected Result**: The `public.units` table updates the `tenant_id` and sets status to `occupied`. Previous unit (if any) is set back to `vacant`.
- **Pass/Fail**: [ ]
- **Evidence**: UI updates; Database row update in `public.units`.

---

## 3. Maintenance Requests (Tenant)

### Feature: Tenant Submits Maintenance Request
- **Preconditions**: Tenant is logged in and assigned to a Unit.
- **Steps**:
  1. Open dashboard and navigate to `/tenant/request/new`.
  2. Fill out Title, Description, Category, Priority.
  3. Upload an image file.
  4. Submit.
- **Expected Result**: 
  - Request is inserted into `public.maintenance_requests` with `status = 'pending'`, inheriting the `property_id` and `unit_id` from the tenant's assigned unit.
  - Image is uploaded to `maintenance-images` Supabase bucket.
  - Attachment record is created in `public.attachments`.
- **Pass/Fail**: [ ]
- **Evidence**: Screenshot of success message; Row in `maintenance_requests`; Row in `attachments`; File in Supabase Storage.

### Feature: Tenant Views Requests (RLS Verification)
- **Preconditions**: Tenant is logged in. Multiple requests exist from different tenants.
- **Steps**:
  1. Navigate to `/tenant/requests`.
- **Expected Result**: Tenant *only* sees requests where `tenant_id` matches their own `auth.uid()`. Row-Level Security correctly rejects viewing other tenants' requests.
- **Pass/Fail**: [ ]
- **Evidence**: Screenshot of list; direct Postgres query verification.

---

## 4. Maintenance Workflow (Technician & Manager)

### Feature: Manager Assigns Technician
- **Preconditions**: Logged in as Manager. A 'pending' request exists. A technician exists.
- **Steps**:
  1. Navigate to `/manager/requests`.
  2. Select a request and assign a technician from the dropdown.
- **Expected Result**: Request updates to `status = 'assigned'` and `assigned_to = technician_id`. Notification is generated for the technician.
- **Pass/Fail**: [ ]
- **Evidence**: Database update; Notification row.

### Feature: Technician Updates Status
- **Preconditions**: Logged in as Technician. A request is assigned to them.
- **Steps**:
  1. Navigate to `/technician/assigned-requests`.
  2. Update status of the request to 'in_progress' or 'completed'.
- **Expected Result**: Request status is updated. If 'completed', the `completed_at` timestamp is set. 
- **Pass/Fail**: [ ]
- **Evidence**: Status pill changes in UI; `completed_at` reflects current timestamp in DB.

---

## 5. Security & Infrastructure

### Feature: RLS Policy Integrity
- **Preconditions**: N/A
- **Steps**:
  1. Attempt to execute raw SQL queries via the REST API anonymously or with a forged JWT.
- **Expected Result**: All tables (`profiles`, `properties`, `units`, `maintenance_requests`, `attachments`, `notifications`, `audit_logs`) block unauthorized read/write access.
- **Pass/Fail**: [ ]
- **Evidence**: Postman/cURL output showing 401 Unauthorized or empty JSON arrays.
