# SMARTMAINTAIN
# System Architecture

Version 1.0

---

# Architecture Style

Modern Serverless Web Application

Frontend
↓

Supabase Backend

↓

PostgreSQL Database

↓

Vercel Deployment

---

# Technology Stack

Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui

Backend

Supabase

- Authentication
- PostgreSQL
- Storage
- Edge Functions (optional)

Deployment

- Vercel

State

- Zustand

Forms

- React Hook Form
- Zod

Tables

- TanStack Table

Charts

- Recharts

Notifications

- Sonner

Icons

- Lucide

---

# Folder Structure

app/

components/

components/ui/

components/dashboard/

components/forms/

components/layout/

lib/

hooks/

services/

types/

utils/

supabase/

middleware/

public/

---

# Authentication Flow

User

↓

Supabase Auth

↓

JWT Session

↓

Middleware

↓

Protected Routes

↓

Dashboard

---

# Database Layer

Supabase PostgreSQL

Tables

- profiles
- properties
- units
- maintenance_requests
- attachments
- notifications

---

# Storage

Supabase Storage

Buckets

maintenance-images

profile-images

---

# Route Structure

/

login

register

forgot-password

/dashboard

/dashboard/requests

/dashboard/properties

/dashboard/units

/dashboard/tenants

/dashboard/reports

/profile

/settings

---

# Component Architecture

Layout

↓

Sidebar

↓

Navbar

↓

Dashboard

↓

Cards

↓

Tables

↓

Forms

↓

Dialogs

---

# State Management

Global

- User
- Theme

Local

- Forms
- Filters
- Dialogs

---

# Security

Supabase Auth

Row Level Security

Protected Routes

Environment Variables

Server Actions

Input Validation

---

# Deployment Pipeline

Developer

↓

Git

↓

GitHub

↓

Vercel

↓

Production

Backend

↓

Supabase Cloud

---

# CI Philosophy

Every commit must compile.

No broken main branch.

Deploy continuously.

---

# Docker

Development occurs inside containers.

Container includes

Node LTS

pnpm

Git

Supabase CLI

TypeScript

ESLint

---

# Coding Standards

Strict TypeScript

Reusable Components

No duplicated logic

Feature-first organization

Meaningful naming

Zero console.log in production

---

# Performance Targets

Page Load

<2s

API

<500ms

Lighthouse

90+

Accessibility

WCAG AA


