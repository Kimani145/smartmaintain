# Changelog

## [1.0.0-rc.1] - 2026-07-19

### Added
- Multi-role authentication flow (Tenant, Technician, Manager, Admin).
- Role-gated dashboard routing middleware.
- Property and Unit management interface for managers.
- Tenant assignment workflow.
- Maintenance request submission with Supabase Storage image attachments.
- Maintenance request management interface for managers.
- Technician assignment and status update interface.
- Complete OpenAPI 3.1 schema.
- Complete Database ERD and Dictionary.
- System Security and Architecture Documentation.
- Traceability Matrix and Acceptance Test Plan.

### Fixed
- Replaced `open` enum value with `pending` across all frontend mutations to comply with Postgres schema constraints.
- Fixed Postgres trigger schema conflict where `first_name` and `last_name` were used instead of `full_name`.
- Eliminated all TypeScript `any` types and `ts-ignore` flags across the repository.
- Fixed `NOT NULL` constraint violations for `property_id` and `unit_id` during maintenance request creation by querying the assigned unit server-side.
