# SMARTMAINTAIN
# Database Specification

Version: 1.0

---

## Database

PostgreSQL (Supabase)

Naming Convention

- snake_case
- UUID primary keys
- timestamptz timestamps
- Foreign keys with CASCADE where appropriate

---

## profiles

Purpose

Stores authenticated user metadata.

Fields

id UUID PK REFERENCES auth.users(id)

full_name TEXT NOT NULL

email TEXT UNIQUE NOT NULL

phone TEXT

role TEXT CHECK(role IN ('admin','manager','tenant','technician'))

avatar_url TEXT

created_at TIMESTAMPTZ DEFAULT NOW()

updated_at TIMESTAMPTZ DEFAULT NOW()

---

## properties

id UUID PK

name TEXT

location TEXT

description TEXT

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ

---

## units

id UUID PK

property_id UUID FK

tenant_id UUID FK NULLABLE

unit_number TEXT

floor TEXT

status TEXT

rent DECIMAL

created_at

updated_at

---

## maintenance_requests

id UUID PK

tenant_id UUID FK

property_id UUID FK

unit_id UUID FK

title TEXT

description TEXT

category TEXT

priority TEXT

status TEXT

assigned_to UUID FK

created_at

updated_at

completed_at

---

## attachments

id UUID PK

request_id UUID FK

url TEXT

created_at

---

## notifications

id UUID PK

user_id UUID FK

title TEXT

message TEXT

read BOOLEAN

created_at

---

## audit_logs

id UUID PK

user_id UUID FK

action TEXT

entity TEXT

entity_id UUID

changes JSONB

created_at

---

Indexes

tenant_id

status

priority

property_id

created_at

assigned_to

---

Enums

Role

admin

manager

tenant

technician

Status

pending

assigned

in_progress

completed

cancelled

Priority

low

medium

high

urgent

---

RLS

Profiles

Users read/update own profile.

Managers read all.

Admins full access.

Maintenance

Tenant

Own requests only.

Manager

CRUD.

Technician

Assigned requests.

Admin

Full.

Storage

maintenance-images

Tenant upload

Manager read

Technician read
