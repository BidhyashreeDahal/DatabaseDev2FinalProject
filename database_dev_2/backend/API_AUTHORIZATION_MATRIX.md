# API Authorization Matrix

This file defines the expected authentication and authorization policy for backend API routes.

## Policy Rules
- Baseline authentication is enforced by middleware for all API routes except explicit public auth endpoints.
- Route handlers must enforce method-level RBAC with hasPermission unless endpoint is explicitly AUTH_ONLY.
- OPTIONS handlers are CORS/preflight only.

## Endpoint Matrix

### Public
- POST /api/auth/login
- POST /api/auth/logout

### Auth Only
- GET /api/auth/me

### Auth + Permission
- GET /api/items -> READ_ITEM
- POST /api/items -> CREATE_ITEM
- GET /api/items/[id] -> READ_ITEM
- PUT /api/items/[id] -> UPDATE_ITEM
- DELETE /api/items/[id] -> DELETE_ITEM

- GET /api/customers -> READ_CUSTOMER
- POST /api/customers -> CREATE_CUSTOMER

- GET /api/sources -> READ_SOURCE
- POST /api/sources -> CREATE_SOURCE

- GET /api/acquisitions -> READ_ACQUISITION
- POST /api/acquisitions -> CREATE_ACQUISITION

- GET /api/sales -> READ_SALE
- POST /api/sales -> CREATE_SALE

- GET /api/price-history -> READ_ITEM
- POST /api/price-history -> UPDATE_ITEM
- GET /api/price-history/[id] -> READ_ITEM
- PUT /api/price-history/[id] -> UPDATE_ITEM
- DELETE /api/price-history/[id] -> UPDATE_ITEM

- GET /api/authors -> READ_ITEM
- POST /api/authors -> CREATE_ITEM
- GET /api/cartographers -> READ_ITEM
- POST /api/cartographers -> CREATE_ITEM
- GET /api/publishers -> READ_ITEM
- POST /api/publishers -> CREATE_ITEM

- GET /api/users -> READ_USER
- GET /api/audit-logs -> READ_AUDIT_LOGS

## Known TODO Stubs (currently 501)
The following routes are placeholders and intentionally excluded from strict route-level RBAC guard checks until implemented:
- GET /api/acquisitions/[id]
- GET /api/sales/[id]
- GET /api/customers/[id]
- PATCH /api/customers/[id]
- DELETE /api/customers/[id]
- GET /api/sources/[id]
- PATCH /api/sources/[id]
- DELETE /api/sources/[id]
- GET /api/users/[id]
- PATCH /api/users/[id]
- DELETE /api/users/[id]

## New Endpoint Checklist
1. Add route entry to this matrix before implementation.
2. Confirm middleware coverage (route is not accidentally public).
3. Add getSessionUser check in handler for protected methods.
4. Add hasPermission check with the correct permission key for protected methods.
5. Keep CORS behavior consistent using withCors where applicable.
6. Add verification case in PHASE4_VERIFICATION.md for status-code expectations.
