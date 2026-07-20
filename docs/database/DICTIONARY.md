# Database Dictionary

## Enums
- **`user_role`**: `admin`, `manager`, `tenant`, `technician`
- **`request_status`**: `pending`, `assigned`, `in_progress`, `completed`, `cancelled`, `rejected`
- **`request_priority`**: `low`, `medium`, `high`, `urgent`

## Tables

### `profiles`
User profiles synced with Supabase Auth (`auth.users`).
- `id` (UUID, PK): Links to auth.users
- `full_name` (TEXT)
- `email` (TEXT, UNIQUE)
- `phone` (TEXT, nullable)
- `role` (user_role): Default `tenant`
- `avatar_url` (TEXT, nullable)

### `properties`
Physical properties managed by the system.
- `id` (UUID, PK)
- `name` (TEXT)
- `location` (TEXT)
- `description` (TEXT, nullable)

### `units`
Individual units within a property.
- `id` (UUID, PK)
- `property_id` (UUID, FK)
- `tenant_id` (UUID, FK, nullable): Links to `profiles`
- `unit_number` (TEXT)
- `floor` (TEXT, nullable)
- `status` (TEXT): Default `vacant`
- `rent` (DECIMAL)

### `maintenance_requests`
Maintenance tasks submitted by tenants.
- `id` (UUID, PK)
- `tenant_id` (UUID, FK)
- `property_id` (UUID, FK)
- `unit_id` (UUID, FK)
- `title` (TEXT)
- `description` (TEXT)
- `category` (TEXT)
- `priority` (request_priority): Default `medium`
- `status` (request_status): Default `pending`
- `assigned_to` (UUID, FK, nullable): Links to `profiles`

### `attachments`
Images or documents attached to maintenance requests.
- `id` (UUID, PK)
- `request_id` (UUID, FK)
- `url` (TEXT)

### `notifications`
System notifications for users.
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `title` (TEXT)
- `message` (TEXT)
- `read` (BOOLEAN): Default `FALSE`

### `audit_logs`
System action logs.
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `action` (TEXT)
- `entity` (TEXT)
- `entity_id` (UUID)
- `changes` (JSONB)
