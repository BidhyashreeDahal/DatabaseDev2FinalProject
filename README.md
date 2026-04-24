<p align="center">
  <img src="./database_dev_2/frontend/Logo.png" alt="Britannicus Reading Room logo" width="360" />
</p>

<h1 align="center">The Britannicus Reading Room</h1>
<p align="center"><strong>Rare Books &middot; Antique Maps &middot; Fine Editions</strong></p>

<p align="center">
  A full-stack, database-driven inventory and sales management system built for a rare-book and antique-map retailer case study.
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-CSS-38BDF8?logo=tailwindcss&logoColor=white" />
  <img alt="JWT" src="https://img.shields.io/badge/Auth-JWT%20%2B%20HTTP--only%20cookies-000?logo=jsonwebtokens&logoColor=white" />
</p>

---

## Table of Contents

1. [Overview](#overview)
2. [Highlights](#highlights)
3. [Tech Stack](#tech-stack)
4. [System Architecture](#system-architecture)
5. [Data Model](#data-model)
6. [Security &amp; Access Control](#security--access-control)
7. [Feature Walkthrough](#feature-walkthrough)
8. [Getting Started](#getting-started)
9. [Project Structure](#project-structure)
10. [Roadmap](#roadmap)
11. [The Team](#the-team)
12. [Acknowledgements](#acknowledgements)

---

## Overview

**The Britannicus Reading Room** is a staff-facing web application that lets a rare-book and antique-map dealership manage their entire operation from a single portal:

- Catalog every **item** (books, maps, periodicals) with rich metadata and provenance.
- Track **acquisitions** from dealers, collectors, and estates.
- Record **sales**, **customers**, and **payments**.
- Maintain an auditable **price history** for market-value tracking.
- Enforce fine-grained **role-based access** so that pricing, dealer contacts, and provenance are only visible to the right staff.

It was built as the capstone project for *Database Development II* by a team of six. The repository is structured as a **monorepo** containing a Next.js **frontend** (staff portal) and a Next.js **API backend** backed by **PostgreSQL** through **Prisma ORM**.

> Case study: Connor (owner), Luciia (manager), and Derek (employee) run a specialist shop dealing in rare books and antique maps. Each staff role sees a different slice of the system according to business rules.

---

## Highlights

- **Normalized relational schema** (20+ tables) modeling items, item subtypes (book / map / periodical), sources (dealer / collector / estate), sales, customers, addresses, provenance, and price history.
- **Full CRUD REST API** with consistent validation, error handling, and CORS-aware deployment split (frontend and backend on separate origins).
- **JWT authentication** stored in **HTTP-only, SameSite, `Secure`-in-production** cookies &mdash; no tokens in `localStorage`.
- **Two-layer authorization**: middleware gate for `/api/*` + per-handler `hasPermission(...)` checks mapped to business permissions such as `READ_PRICING`, `READ_PROVENANCE`, `READ_DEALER_CONTACT`, and `UPDATE_PRICING`.
- **Immutable audit logging** of privileged actions, viewable only by administrators.
- **Clean layered backend** &mdash; routes &rarr; services &rarr; repositories &rarr; Prisma &mdash; with a dedicated permissions library and a documented [API Authorization Matrix](./database_dev_2/backend/API_AUTHORIZATION_MATRIX.md).
- **Typed, responsive UI** built with the Next.js App Router, React 19, and Tailwind CSS; permission-aware rendering hides fields the current user is not allowed to see.
- **Automated guard verification** (`npm run verify:api-guards`) that statically checks every protected route has an auth + permission check before merging.
- **Seed script** provisions realistic demo data so the app is usable in under a minute after clone.

---

## Tech Stack

| Layer            | Technology                                                    |
|------------------|---------------------------------------------------------------|
| Frontend         | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS   |
| Backend API      | Next.js Route Handlers, Node.js 20                            |
| ORM &amp; Migrations | Prisma                                                     |
| Database         | PostgreSQL                                                    |
| Auth             | JWT (HS256) in HTTP-only cookies, bcrypt password hashing     |
| Tooling          | ESLint, npm workspaces, Prisma Studio                         |
| Deployment       | Split deploy &mdash; Vercel (frontend) + Render/Fly/etc. (API) |

---

## System Architecture

```text
                  ┌──────────────────────────┐
                  │   Browser (staff user)   │
                  └─────────────┬────────────┘
                                │  HTTPS + auth_token cookie
                                ▼
          ┌──────────────────────────────────────────┐
          │  Next.js Frontend  (App Router, RSC/CSR) │
          │  - Permission-aware UI                   │
          │  - Typed API client (fetch wrappers)     │
          └─────────────────┬────────────────────────┘
                            │  REST /api/*
                            ▼
          ┌──────────────────────────────────────────┐
          │  Next.js Backend API                     │
          │  ├─ middleware.ts   (auth gate, CORS)    │
          │  ├─ routes          (REST handlers)      │
          │  ├─ services        (business logic)     │
          │  ├─ repositories    (data access)        │
          │  └─ lib/            (auth, permissions,  │
          │                      audit, validation)  │
          └─────────────────┬────────────────────────┘
                            │  Prisma Client
                            ▼
                  ┌──────────────────────┐
                  │     PostgreSQL       │
                  └──────────────────────┘
```

Requests flow through two enforcement points:

1. **Middleware** &mdash; rejects unauthenticated calls to any `/api/*` route (except the public `POST /api/auth/login` and `POST /api/auth/logout`).
2. **Route handler** &mdash; calls `getSessionUser(...)` and `hasPermission(user, PERMISSION)` before touching the database. Sensitive fields (e.g. cost, provenance, dealer email) are stripped server-side when the caller lacks the relevant permission.

---

## Data Model

High-level entities and how they relate:

```text
role ──< user ──< sales >── payment_method
                    │
customer ──< customer_address >── address
   │
   └──< sales >── item ──< price_history
                   ├──< provenance
                   ├─── book  ── author
                   ├─── book  ── publisher
                   ├─── map   ── cartographer
                   ├─── map   ── publisher
                   └─── periodical ── publisher

source ──┬── dealer
         ├── collector
         └── estate
             │
             └──< acquisition >── item
```

Key design choices:

- **Item subtyping**: `item` holds shared attributes (title, condition, cost, selling price, images). `book`, `map`, and `periodical` extend it 1-to-1 with type-specific fields (ISBN, binding, scale, issue date, etc.).
- **Source subtyping**: a single `source` can be refined as a `dealer`, `collector`, or `estate`, each with its own attributes (specialty, reliability rating, estate contact person, &hellip;).
- **Provenance chain**: every item can have multiple historical owners with verified/unverified status &mdash; critical for rare-books authenticity.
- **Price history**: market valuations are stored over time instead of overwriting a single price field, giving the shop a full audit trail.
- **Referential integrity**: `ON DELETE RESTRICT` on business records; `ON DELETE SET NULL` only where a related entity is optional (e.g. a map may outlive its cartographer record).

The full schema lives in [`database_dev_2/backend/prisma/schema.prisma`](./database_dev_2/backend/prisma/schema.prisma) and the initial migration at [`database_dev_2/backend/prisma/migrations/20260324231415_init/migration.sql`](./database_dev_2/backend/prisma/migrations/20260324231415_init/migration.sql).

---

## Security &amp; Access Control

The application ships with a documented **API Authorization Matrix** (see [`database_dev_2/backend/API_AUTHORIZATION_MATRIX.md`](./database_dev_2/backend/API_AUTHORIZATION_MATRIX.md)). Examples:

| Role       | Can browse catalog | Can edit pricing | Can see dealer contact | Can see provenance | Can view audit log |
|------------|:------------------:|:----------------:|:----------------------:|:------------------:|:------------------:|
| Admin      |         ✓          |        ✓         |           ✓            |         ✓          |         ✓          |
| Manager    |         ✓          |        ✓         |           ✓            |         ✓          |         ✗          |
| Employee   |         ✓          |        ✗         |           ✗            |         ✗          |         ✗          |

Under the hood:

- Passwords are hashed with **bcrypt** before storage.
- Sessions are issued as signed **JWTs** and delivered as **HTTP-only** cookies with `SameSite=Lax` (and `Secure` in production).
- CORS is pinned to an allow-list of origins (`CORS_ALLOWED_ORIGINS`) so the API can be safely deployed on a different domain from the UI.
- Every privileged mutation writes an entry to the `audit_log` table (who, what, when, and a diff of relevant fields).
- A custom `npm run verify:api-guards` script walks every route in `src/app/api` and fails the build if a protected route forgets to call `hasPermission(...)`.

---

## Feature Walkthrough

- **Login / Logout** &mdash; `/login` with server-validated credentials, JWT cookie issued on success.
- **Dashboard** &mdash; landing page with quick links to the modules the current user has permission for.
- **Items** &mdash; list, search, view, create, edit, and delete inventory items (books, maps, periodicals) with images, condition, and optional provenance entries.
- **Customers** &mdash; contact records with one or more addresses, purchase history linked via sales.
- **Sources** &mdash; dealers, collectors, and estates that items are acquired from; dealer contacts hidden from employees by default.
- **Acquisitions** &mdash; record how and from whom each item entered inventory.
- **Sales** &mdash; record sales with customer, item, staff member, and payment method; server-side validates selling price against price history.
- **Price History** &mdash; append-only market-value log per item.
- **Users &amp; Roles** &mdash; admin-only user management UI.
- **Audit Logs** &mdash; admin-only, immutable activity feed.

---

## Getting Started

### Prerequisites

- Node.js **20+** and npm **10+**
- PostgreSQL (local or cloud)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd DatabaseDev2FinalProject/database_dev_2
npm install
npm --prefix frontend install
npm --prefix backend install
```

### 2. Configure environment

`backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"
JWT_SECRET="replace-with-a-strong-secret"
CORS_ALLOWED_ORIGINS="http://localhost:3000"
```

`frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000"
```

### 3. Set up the database

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

The seed script creates demo roles, users (admin / manager / employee), items, sources, acquisitions, and sales so you can explore the app immediately.

### 4. Run the app

From `database_dev_2/`:

```bash
npm run dev:backend     # API on http://localhost:4000
npm run dev:frontend    # UI  on http://localhost:3000
```

### 5. Useful scripts

```bash
npm run build:backend
npm run build:frontend
npm run lint:backend
npm run lint:frontend

# Static check that every protected API route has an auth + permission guard
npm --prefix backend run verify:api-guards
```

---

## Project Structure

```text
DatabaseDev2FinalProject/
└── database_dev_2/
    ├── backend/
    │   ├── prisma/
    │   │   ├── schema.prisma      # Source of truth for the DB
    │   │   ├── migrations/        # Version-controlled SQL migrations
    │   │   └── seed.ts            # Demo data
    │   ├── src/
    │   │   ├── app/api/           # Next.js route handlers (REST)
    │   │   ├── services/          # Business logic
    │   │   ├── repositories/      # Prisma-backed data access
    │   │   ├── lib/               # auth, permissions, audit, CORS
    │   │   └── middleware.ts      # Auth gate for /api/*
    │   └── API_AUTHORIZATION_MATRIX.md
    └── frontend/
        └── src/
            ├── app/               # App Router pages (items, sales, …)
            ├── api/               # Typed API client wrappers
            └── lib/               # Permissions + validation helpers
```

---

## Roadmap

Ideas we scoped but left out of the final submission:

- [ ] Reporting module with monthly sales, margin, and inventory-turnover charts
- [ ] Customer-facing storefront with Stripe checkout
- [ ] Full-text search across titles, authors, and provenance notes
- [ ] Image upload to S3-compatible storage
- [ ] Automated end-to-end tests with Playwright

---

## The Team

This project was built by six students for *Database Development II*.

| Member | Role / Primary Contribution |
|--------|-----------------------------|
| Bidhyashree Dahal       | Technical lead, backend API, authentication &amp; RBAC* |
| Sreeraj & Rechal        |  Database schema &amp; Prisma migrations*           |
| Bidhyashree & Hayden    | Frontend architecture &amp; UI components*         |
| Sreeraj, Rechal, Bidhyashree, hayden| Customers, Sources  Acquisitions modules|
| Marvin, Simeon, Bidhyashree  | Testing, deployment &amp; documentation |

My Contribution (Bidhyashree)
I contributed across both frontend and backend implementation:

Built and refined key frontend pages and flows in Next.js
Developed backend API routes and business logic
Integrated frontend with backend APIs
Helped implement authentication/authorization behavior and permission-aware UI flow
Contributed to end-to-end feature delivery for core modules


## Acknowledgements

- Case-study scenario inspired by the *Britannicus Reading Room*, a fictional rare-books and antique-maps retailer used throughout the *Database Development II* course.
- Built with [Next.js](https://nextjs.org), [Prisma](https://www.prisma.io), [PostgreSQL](https://www.postgresql.org), and [Tailwind CSS](https://tailwindcss.com).

---

<p align="center">
  <em>Built with care by a team of six &mdash; designed to be clean to read, easy to run, and honest about what it is.</em>
</p>
