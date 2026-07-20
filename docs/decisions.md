# Architecture Decision Record (ADR)

## ADR-001

Decision:
Supabase instead of a custom Express backend.

Reason:
Reduces implementation time by eliminating authentication, ORM, migrations, and deployment overhead.

Tradeoff:
Less backend flexibility.

Status:
Accepted.

---

## ADR-002

Decision:
No technician mobile app in MVP.

Reason:
Out of scope.

Status:
Accepted.

---

## ADR-003

Decision:
Image uploads handled by Supabase Storage.

Reason:
Native integration and signed URLs.

Status:
Accepted.
