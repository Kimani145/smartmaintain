# SMARTMAINTAIN CONSTITUTION

Version: 1.0

Status: Mandatory

This document is the highest authority in this repository.

Every AI coding agent MUST read this document before reading any other documentation.

If another document conflicts with this constitution, THIS DOCUMENT WINS.

---

# Mission

Deliver a production-ready Maintenance Management System within an extremely constrained implementation window.

The objective is

Ship.

NOT

Research.

NOT

Experiment.

NOT

Showcase every software engineering pattern ever invented.

Every implementation decision must increase delivery probability.

---

# Core Principles

Priority Order

1. Working Software

2. Simplicity

3. Correctness

4. Maintainability

5. Performance

6. Elegance

Anything that delays delivery without improving user value is rejected.

---

# Scope Lock

The project scope is frozen.

No feature may be added unless explicitly listed inside

docs/srs.md

Agents SHALL NOT invent features.

Examples of forbidden additions

❌ AI recommendations

❌ Chatbots

❌ Payment gateways

❌ SMS integration

❌ Email campaigns

❌ Push notifications

❌ Maps

❌ Calendar scheduling

❌ IoT integration

❌ QR scanning

❌ Facial recognition

❌ Blockchain

❌ Machine Learning

❌ Recommendation engines

❌ Offline synchronization

If it is not in the SRS,

DO NOT BUILD IT.

---

# Architecture Lock

Architecture is frozen.

Frontend

Next.js

Backend

Supabase

Database

PostgreSQL

Hosting

Vercel

State

Zustand

UI

shadcn/ui

Tailwind CSS

Agents SHALL NOT replace technologies.

Forbidden substitutions

Firebase

MongoDB

Express

Laravel

NestJS

Redux

Prisma

Drizzle

MySQL

SQLite

Microservices

Electron

React Native

---

# Keep It Boring

Prefer boring technology.

Boring software ships.

Exciting software misses deadlines.

Choose

Simple

Predictable

Documented

Stable

---

# No Reinvention

Never build functionality already provided by Supabase.

Authentication

Storage

Database

Authorization

Realtime

Use platform capabilities.

---

# Simplicity Doctrine

When two implementations satisfy the same requirement,

choose

- fewer files

- fewer dependencies

- less code

- easier debugging

- easier deployment

---

# Dependency Doctrine

Every dependency must justify its existence.

Before adding any package ask

Does the platform already solve this?

Can native JavaScript solve this?

Can an existing package already installed solve this?

If yes,

DO NOT ADD A NEW DEPENDENCY.

---

# File Discipline

Every file must have one responsibility.

Avoid

utils2.ts

helpers_new.ts

copy.ts

copy-final.ts

temp.ts

newfolder/

old/

misc/

---

# Component Rules

Components must

Be reusable

Be typed

Be small

Avoid prop drilling

Avoid duplicated logic

---

# Naming

Use descriptive names.

Good

MaintenanceRequestCard

PropertyTable

TenantProfileForm

Bad

Card2

Helper

Thing

Temp

Data

---

# TypeScript

Strict mode.

No any.

No ts-ignore unless absolutely unavoidable.

Fix types instead of bypassing them.

---

# Error Handling

Never silently fail.

Every asynchronous operation

returns

loading

success

error

Every API response

must be validated.

---

# UI Rules

Modern SaaS

Minimal

Responsive

Accessible

No decorative animations.

No excessive gradients.

No visual clutter.

Performance over aesthetics.

---

# Performance Budget

First Load

<2 seconds

No unnecessary rerenders.

Lazy load large components.

Optimize images.

---

# Security

Always validate inputs.

Never trust client data.

Enable Row Level Security.

Protect every route.

Never expose service role keys.

---

# Database Rules

Never duplicate data.

Prefer foreign keys.

Maintain referential integrity.

Soft delete only when business logic requires it.

---

# Git Discipline

Small commits.

Descriptive commit messages.

Never commit secrets.

Never commit .env.

---

# Documentation

Code should explain itself.

Comments explain WHY.

Not WHAT.

Every exported function should have meaningful naming.

---

# Testing Doctrine

Before marking a task complete

Compile

Lint

Type check

Run locally

Verify UI

Verify database

Verify authentication

---

# Scope Creep Filter

Before implementing anything ask

Is this explicitly required?

Will the user notice its absence?

Will removing it prevent project acceptance?

If the answer is

No

Do not build it.

---

# Decision Hierarchy

When making technical decisions

1. Constitution

2. SRS

3. Architecture

4. API

5. Database

6. UI Specification

7. Existing Code

Never reverse this order.

---

# Agent Behavior

Agents are IMPLEMENTERS.

Agents are NOT product managers.

Agents are NOT architects.

Agents are NOT designers.

Agents SHALL NOT redesign completed modules.

Agents SHALL NOT rename files without reason.

Agents SHALL NOT introduce breaking changes.

Agents SHALL preserve consistency.

---

# Definition of Done

A feature is complete only if

✓ Builds successfully

✓ Fully typed

✓ Linted

✓ Responsive

✓ Connected to Supabase

✓ Uses documented API

✓ Meets SRS

✓ No placeholder code

✓ No TODO comments

✓ No mock data

✓ Deployable

---

# Final Rule

Every line of code must answer one question

"Does this increase the probability of shipping?"

If not,

delete it.
