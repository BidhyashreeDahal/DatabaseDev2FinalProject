<p align="center">
  <img src="./frontend/Logo.png" alt="Britannicus Reading Room logo" width="180" />
</p>

<h1 align="center">The Britannicus Reading Room</h1>
<p align="center"><strong>Rare Books • Antique Maps • Fine Editions</strong></p>

Database-driven inventory and sales management system for the Britannicus Reading Room case study.

This monorepo contains:

- `frontend` - Next.js App Router UI (staff portal)
- `backend` - Next.js API + Prisma (PostgreSQL)

Default local ports:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000`

---

## 1) Prerequisites

- Node.js 20+ (recommended LTS)
- npm 10+
- PostgreSQL database (local or cloud)

---

## 2) Install Dependencies

From repo root (`database_dev_2`):

```bash
npm install
npm --prefix frontend install
npm --prefix backend install
```

---

## 3) Environment Variables

### Backend (`backend/.env`)

Create `backend/.env` with:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"
JWT_SECRET="replace-with-a-strong-secret"
CORS_ALLOWED_ORIGINS="http://localhost:3000"
```

Notes:

- For multiple allowed origins, use comma-separated values.
- Example:
  `CORS_ALLOWED_ORIGINS="http://localhost:3000,https://your-frontend-domain.com"`

### Frontend (`frontend/.env.local`)

Create `frontend/.env.local` with:

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000"
```

For production, set this to your deployed backend URL.

---

## 4) Database Setup (Prisma)

From `backend`:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

This creates schema and seed data (items, sources, acquisitions, sales, users, etc.) for demo.

---

## 5) Run Locally

From repo root:

```bash
npm run dev:backend
npm run dev:frontend
```

Or run individually:

```bash
# backend
npm --prefix backend run dev

# frontend
npm --prefix frontend run dev
```

---

## 6) Build and Lint

From repo root:

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

## 7) Deploy Guide (Quick)

Deploy as two services:

1. **Backend** (Next.js API)  
2. **Frontend** (Next.js web app)

### Backend environment (production)

- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ALLOWED_ORIGINS` (must include frontend production URL)
- `NODE_ENV=production`

### Frontend environment (production)

- `NEXT_PUBLIC_API_BASE_URL` = deployed backend URL

### Important auth/cookie note

- Auth uses HTTP-only cookie (`auth_token`) with `SameSite=Lax`.
- Cookie is `secure` when `NODE_ENV=production`, so deploy over HTTPS.

---

## 8) Scripts Reference

### Root (`database_dev_2/package.json`)

- `npm run dev:frontend`
- `npm run dev:backend`
- `npm run build:frontend`
- `npm run build:backend`
- `npm run lint:frontend`
- `npm run lint:backend`

### Backend (`backend/package.json`)

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:seed`
- `npm run verify:api-guards`

### Frontend (`frontend/package.json`)

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

---

## 9) Tech Stack

- Next.js (frontend + backend routes)
- React
- Prisma ORM
- PostgreSQL
- Tailwind CSS

---

## 10) Project Structure

```text
database_dev_2/
  frontend/   # UI (App Router)
  backend/    # API routes + Prisma
```
