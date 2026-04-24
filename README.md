<p align="center">
  <img src="./database_dev_2/frontend/Logo.png" alt="Britannicus Reading Room logo" width="320" />
</p>

<h1 align="center">The Britannicus Reading Room</h1>
<p align="center"><strong>Database-Driven Inventory and Sales Management System</strong></p>
<p align="center">
  Durham College - INFT 3201 (Database Development II) Team Capstone
</p>

---

## Overview

The Britannicus Reading Room is a full-stack web application built for a case study involving a rare-book and antique-map retailer.  
The business needed a reliable way to manage:

- Inventory across books, periodicals, and maps
- Acquisitions from dealers, collectors, estates, and ad-hoc sellers
- Customers, purchases, and sales history
- Market pricing and price history
- Role-based access to sensitive information (pricing, provenance, dealer contact details)

This solution provides a staff-facing portal with secure authentication, database-backed workflows, and operational reporting support.

---

## Case Study Context

Connor Whyte, owner of The Britannicus Reading Room, is shifting the business from general used paperbacks toward higher-value rare books and antique maps (including a newly expanded "Map Room").  
As inventory value and supplier complexity increased, manual tracking became difficult.

Our system was designed to solve that by centralizing data and making day-to-day operations faster, safer, and easier to manage.

---

## Team

This was a six-person team project for Durham College INFT 3201.

| Member | Primary Contributions |
|---|---|
| Bidhyashree | Frontend and backend development, API integration, authentication and permission-aware flows |
| Hayden | Frontend implementation and UI support |
| Marvin | Testing, deployment support, documentation |
| Rachel | Database design support and feature implementation |
| Simeon | Testing, deployment support, documentation |
| Sreeraj | Database design support and feature implementation |

### My Contribution (Bidhyashree)

I contributed across both frontend and backend development:

- Built and refined core frontend pages and user flows in Next.js
- Developed backend API routes and business logic for key modules
- Integrated frontend features with backend APIs
- Implemented and validated authentication and role-based access behavior
- Helped deliver end-to-end functionality across inventory, customer, and sales workflows

---

## Key Features

- Secure sign-in and session management
- Role-based access control for staff users
- Inventory management for books, maps, and periodicals
- Source and acquisition tracking (dealers, collectors, estates)
- Customer and sales management
- Price history tracking to support market monitoring
- Audit-aware backend patterns for protected operations

---

## Tech Stack

- Frontend: Next.js (App Router), React, Tailwind CSS
- Backend: Next.js Route Handlers (API layer), Node.js
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT + HTTP-only cookie session strategy

---

## System Architecture

```text
frontend (Next.js) -> backend API (Next.js route handlers) -> Prisma -> PostgreSQL
```

- `frontend` contains the staff portal UI.
- `backend` contains API routes, service/repository logic, auth, permissions, and database access.

---

## Screenshots

### Landing Page
![Landing Page](./database_dev_2/frontend/LandingPage.png)

### Sign In Page
![Sign In Page](./database_dev_2/frontend/SignInPage.png)

### Items Page
![Items Page](./database_dev_2/frontend/Items%20page.png)

### Individual Item Page
![Individual Item Page](./database_dev_2/frontend/IndividualItemPage.png)

---

## Getting Started

### 1) Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL database

### 2) Install Dependencies

From `database_dev_2/`:

```bash
npm install
npm --prefix frontend install
npm --prefix backend install
```

### 3) Configure Environment Variables

Create `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"
JWT_SECRET="replace-with-a-strong-secret"
CORS_ALLOWED_ORIGINS="http://localhost:3000"
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000"
```

### 4) Initialize Database

From `backend/`:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 5) Run the App

From `database_dev_2/`:

```bash
npm run dev:backend
npm run dev:frontend
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000`

---

## Useful Scripts

From `database_dev_2/`:

```bash
npm run build:backend
npm run build:frontend
npm run lint:backend
npm run lint:frontend
```

Optional backend guard verification:

```bash
npm --prefix backend run verify:api-guards
```

---

## Project Structure

```text
database_dev_2/
  frontend/   # Next.js staff UI
  backend/    # Next.js API + Prisma + PostgreSQL
```

---

## Deliverables Completed (Course Milestones)

- Deliverable 1: Initial planning, mission statement, system boundary, project plan
- Deliverable 2: Requirements, 3NF relational schema, ERD, UI drafts
- Deliverable 3: Final proposal + business pitch presentation + prototype demo
- Deliverable 4: Final technical presentation, database, and working application submission

---

Co-developed a full-stack database application for a rare-books and antique-maps retailer, implementing secure role-based workflows for inventory, acquisitions, customers, sales, and pricing using Next.js, Prisma, and PostgreSQL.
