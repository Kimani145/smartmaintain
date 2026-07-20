# SMARTMAINTAIN SYSTEM
## Software Requirements Specification (SRS)

**Version:** 1.0
**Status:** Implementation Ready
**Project Type:** Rental Property Maintenance Management System
**Deployment Target:** Web Application (Responsive)
**Architecture:** Next.js + Supabase + Vercel

---

# 1. Project Overview

SMARTMAINTAIN is a web-based maintenance management platform that enables tenants to report house maintenance issues while allowing property managers to assign, track, and resolve maintenance requests from a centralized dashboard.

The system replaces phone calls, SMS, and verbal complaints with a structured digital workflow.

---

# 2. Objectives

- Reduce maintenance response time.
- Digitize maintenance reporting.
- Improve accountability.
- Track issue lifecycle.
- Maintain historical maintenance records.
- Improve tenant satisfaction.

---

# 3. Stakeholders

- Property Manager
- Tenant
- Technician (Optional)
- System Administrator

---

# 4. User Roles

## Tenant

Permissions

- Register/Login
- Submit maintenance request
- Upload photos
- Track request progress
- View maintenance history
- Receive notifications

---

## Property Manager

Permissions

- Login
- View all requests
- Assign technician
- Update request status
- View analytics
- Manage tenants
- Manage houses



## Administrator

Permissions

- Full system access
- Manage users
- Configure system
- Backup data
- Audit logs

---

# 5. Functional Requirements

## Authentication

Users shall

- Register
- Login
- Logout
- Reset password

Authentication will use Supabase Auth.

---

## Tenant Management

The system shall

- Create tenant profile
- Edit profile
- View profile
- Suspend account

---

## Property Management

The system shall

- Register properties
- Register rental units
- Assign tenants to units

---

## Maintenance Requests

Tenants shall be able to

- Create request
- Select maintenance category
- Enter description
- Upload images
- Set urgency level

Manager shall be able to

- View requests
- Filter requests
- Assign technician
- Change status
- Add notes

Statuses

- Pending
- Assigned
- In Progress
- Completed
- Rejected

---

## Notifications

Users shall receive notifications when

- Request submitted
- Request assigned
- Status changes
- Request completed

---

## Dashboard

Manager Dashboard

Display

- Total Requests
- Pending Requests
- Active Repairs
- Completed Repairs
- Average Resolution Time

Tenant Dashboard

Display

- Active Requests
- Completed Requests
- Latest Updates

---

## Reports

Generate

- Monthly Requests
- Completed Repairs
- Outstanding Repairs
- Maintenance Cost Summary (Future)

Export

- CSV
- PDF

---

# 6. Non-Functional Requirements

## Performance

- Page load < 2 seconds
- API response < 500ms
- Mobile responsive
- Support 100+ concurrent users

---

## Security

- HTTPS
- Password hashing
- Row Level Security
- Role Based Access Control
- Input validation

---

## Reliability

- 99% uptime
- Automatic backups
- Error logging

---

## Usability

- Responsive UI
- Accessible forms
- Simple navigation

---

# 7. Technology Stack

## Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

## Backend

- Supabase

Services

- Authentication
- PostgreSQL
- Storage
- Realtime

Deployment

- Vercel

Validation

- Zod
- React Hook Form

State Management

- Zustand

---

# 8. Database Entities

## Users

- id
- full_name
- email
- role
- phone
- created_at

---

## Properties

- id
- property_name
- location

---

## Units

- id
- property_id
- unit_number
- tenant_id

---

## Maintenance Requests

- id
- tenant_id
- property_id
- unit_id
- title
- description
- category
- priority
- status
- assigned_to
- created_at
- updated_at

---

## Attachments

- id
- request_id
- image_url

---

## Notifications

- id
- user_id
- title
- message
- read
- created_at

---

# 9. Request Workflow

Tenant

↓

Create Request

↓

Manager Review

↓

Assign Technician

↓

Repair In Progress

↓

Completed

↓

Tenant Confirms

---

# 10. API Modules

Authentication

- Login
- Register
- Logout

Users

- CRUD

Properties

- CRUD

Units

- CRUD

Maintenance

- CRUD
- Assign
- Update Status

Notifications

- List
- Mark Read

Reports

- Summary
- Export

---

# 11. UI Pages

Public

- Landing Page
- Login
- Register
- Forgot Password

Tenant

- Dashboard
- My Requests
- New Request
- Profile

Manager

- Dashboard
- Requests
- Properties
- Units
- Tenants
- Reports
- Settings

Administrator

- User Management
- Audit Logs
- System Settings

---

# 12. MVP Scope (30-Hour Sprint)

Must Have

- Authentication
- Dashboard
- Tenant Management
- Property Management
- Maintenance Requests
- Image Upload
- Status Tracking
- Notifications
- Responsive UI
- Live Deployment

Should Have

- Search
- Filters
- Report Export

Won't Build (Sprint)

- Payments
- SMS Integration
- AI Predictions
- IoT Integration
- Offline Mode

---

# 13. Acceptance Criteria

- Users can authenticate successfully.
- Tenants can submit maintenance requests.
- Managers can view and manage all requests.
- Request status updates are reflected immediately.
- Images upload successfully.
- Dashboards display accurate data.
- System is responsive on desktop and mobile.
- Application is deployed and accessible through a live URL.

---

# 14. Deployment

Repository

GitHub

Deployment

Vercel

Backend

Supabase

Storage

Supabase Storage

Database

PostgreSQL (Supabase)

Authentication

Supabase Auth

---

# 15. Future Enhancements

- SMS notifications
- Email reminders
- AI maintenance prediction
- QR code property identification
- Mobile application
- Payment integration
- Maintenance scheduling
- Multi-property support
