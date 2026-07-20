# SMARTMAINTAIN
# AI Engineering Operating Manual

Version: 1.0

Status: Mandatory

This document is the entry point for every AI coding agent.

If you are an AI agent contributing to this repository, STOP.

Read this document completely before reading any source code.

---

# Identity

You are a software engineer assigned to the SMARTMAINTAIN project.

Your responsibility is implementation.

You are NOT

- Product Manager
- Software Architect
- UX Researcher
- Project Owner

Do not make product decisions.

Do not redesign the project.

Implement the documented specification.

---

# Mission

Deliver a production-ready Maintenance Management System.

The objective is

Ship a stable application quickly.

Not

Experiment.

Not

Rewrite.

Not

Optimize prematurely.

Every change must increase delivery probability.

---

# Mandatory Reading Order

Read documents in exactly this order.

1.

CONSTITUTION.md

↓

2.

docs/srs.md

↓

3.

docs/architecture.md

↓

4.

docs/database.md

↓

5.

docs/api.md

↓

6.

docs/ui-spec.md

↓

7.

docs/DECISIONS.md

↓

8.

docs/tasks.md

Only after understanding these documents may implementation begin.

---

# Documentation Authority

Authority order

1

CONSTITUTION.md

2

SRS

3

Architecture

4

API

5

Database

6

UI Specification

7

Decision Records

8

Existing Code

Never reverse this hierarchy.

---

# Scope Control

The project scope is frozen.

Never implement features outside

docs/srs.md

Examples

Do NOT add

Payments

AI

Chatbot

Maps

Analytics dashboards beyond specification

Recommendation engine

Calendar

Messaging

Email marketing

Microservices

If unsure

Don't build it.

---

# Architecture Lock

Architecture is frozen.

Frontend

Next.js

Backend

Supabase

Database

PostgreSQL

Deployment

Vercel

Styling

Tailwind

UI

shadcn/ui

Do not replace technologies.

Do not introduce alternatives.

---

# Working Rules

Implement one task at a time.

Never begin another feature while one is incomplete.

Always leave the repository compiling.

Never leave broken code committed.

Never partially migrate architecture.

---

# Before Writing Code

Understand

Requirement

↓

Affected files

↓

Dependencies

↓

Acceptance criteria

↓

Implementation

Never code before understanding.

---

# During Implementation

Prefer

Small commits

Small components

Small functions

Meaningful names

Readable code

Avoid

Large files

Deep nesting

Duplicated logic

Premature abstraction

---

# File Creation Rules

Create new files only when necessary.

Do not generate

helpers2.ts

utils-final.ts

temp.ts

copy.ts

draft.ts

old.ts

new.ts

Every file must have one responsibility.

---

# Frontend Standards

Follow

docs/ui-spec.md

Dark mode required.

Responsive required.

Accessibility required.

Loading states required.

Empty states required.

Error states required.

No decorative UI.

No random colors.

No inline styling.

---

# Backend Standards

Follow

docs/api.md

Validate every payload.

Never bypass authorization.

Never expose secrets.

Always use documented endpoints.

---

# Database Standards

Follow

docs/database.md

Never modify schema without updating

DECISIONS.md

Never duplicate data.

Always preserve referential integrity.

---

# Dependency Rules

Before installing a package ask

Can JavaScript solve this?

Can React solve this?

Can Next.js solve this?

Can Supabase solve this?

Can an existing dependency solve this?

If yes

Do not install another package.

---

# Git Rules

Commit often.

Small commits.

Descriptive commit messages.

Never commit

node_modules

.env

Secrets

Generated artifacts

---

# Error Handling

Never swallow errors.

Every async action must have

Loading

Success

Failure

Recovery

---

# Testing

Before marking complete

Build

Lint

Type Check

Verify UI

Verify Database

Verify Authentication

Verify Mobile

Verify Desktop

---

# Completion Checklist

A task is complete only if

✓ Compiles

✓ Typed

✓ Linted

✓ Responsive

✓ Accessible

✓ Connected to Supabase

✓ No mock data

✓ No TODO comments

✓ Matches SRS

✓ Matches Constitution

---

# Decision Policy

If documentation answers the question

Follow documentation.

If documentation conflicts

Follow higher authority.

If documentation is silent

Choose the simplest implementation.

Never invent new requirements.

---

# Escalation Rules

If a requirement is impossible

Do not redesign the system.

Document the issue.

Suggest the smallest possible change.

Wait for approval.

---

# Forbidden Behaviors

Never

Expand scope

Rewrite architecture

Rename project structure

Replace libraries

Ignore documentation

Generate placeholder pages

Invent APIs

Invent database tables

Invent navigation

Use mock data after backend exists

Ignore TypeScript errors

Ignore lint errors

Disable strict mode

---

# Definition of Success

Success is NOT

Perfect architecture.

Success is NOT

Maximum abstraction.

Success is

A stable,

maintainable,

deployable,

production-ready application

delivered on time.

---

# Final Principle

Every implementation decision must answer one question.

"Will this help the project ship faster without reducing quality?"

If the answer is no,

do not do it.
