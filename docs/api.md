# API Specification

Architecture

REST over Supabase

JSON

---

Authentication

POST /auth/login

POST /auth/register

POST /auth/logout

POST /auth/reset-password

---

Users

GET /users/me

PATCH /users/me

GET /users

POST /users

PATCH /users/:id

DELETE /users/:id

---

Properties

GET

POST

PATCH

DELETE

---

Units

GET

POST

PATCH

DELETE

---

Maintenance

GET /requests

POST /requests

GET /requests/:id

PATCH /requests/:id

DELETE /requests/:id

PATCH /requests/:id/status

PATCH /requests/:id/assign

---

Attachments

POST

DELETE

---

Notifications

GET

PATCH read

DELETE

---

Reports

GET /reports/dashboard

GET /reports/monthly

GET /reports/export

---

Validation

Zod

No endpoint accepts invalid payloads.

Every endpoint returns

success

message

data

errors

timestamp

---

HTTP Codes

200

201

400

401

403

404

409

422

500
