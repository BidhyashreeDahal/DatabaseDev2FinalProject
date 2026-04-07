# Phase 4 Verification Checklist

This checklist validates staged enforcement behavior after middleware + route RBAC changes.

## Preconditions
- Backend API server is running on port 4000.
- Frontend is running on allowed CORS origin.
- Test users exist for at least two roles:
  - employee
  - admin

## Expected Security Outcomes
- No cookie: protected API routes return 401.
- Valid cookie with insufficient role: route returns 403.
- Valid cookie with allowed role: route returns success (2xx) or expected business status.

## Route Groups to Validate

### Group A: Admin-sensitive routes
- GET /api/audit-logs
  - employee => 403
  - admin => 200
- GET /api/users
  - employee => 403
  - admin => 200

### Group B: Core read routes
- GET /api/items (requires READ_ITEM)
- GET /api/items/{id} (requires READ_ITEM)
- GET /api/customers (requires READ_CUSTOMER)
- GET /api/sources (requires READ_SOURCE)
- GET /api/acquisitions (requires READ_ACQUISITION)
- GET /api/sales (requires READ_SALE)
- GET /api/price-history (requires READ_ITEM)
- GET /api/authors (requires READ_ITEM)
- GET /api/cartographers (requires READ_ITEM)
- GET /api/publishers (requires READ_ITEM)

### Group C: Write routes
- POST /api/items (requires CREATE_ITEM)
- PUT /api/items/{id} (requires UPDATE_ITEM)
- DELETE /api/items/{id} (requires DELETE_ITEM)
- POST /api/price-history (requires UPDATE_ITEM)
- GET /api/price-history/{id} (requires READ_ITEM)
- PUT /api/price-history/{id} (requires UPDATE_ITEM)
- DELETE /api/price-history/{id} (requires UPDATE_ITEM)
- POST /api/customers (requires CREATE_CUSTOMER)
- POST /api/sources (requires CREATE_SOURCE)
- POST /api/acquisitions (requires CREATE_ACQUISITION)
- POST /api/sales (requires CREATE_SALE)
- POST /api/authors, /api/cartographers, /api/publishers (currently mapped to CREATE_ITEM)

## Manual Test Commands (cookie-based)
Use an authenticated cookie jar from login.

1) Login and store cookie:
- curl -i -c cookies.txt -H "Content-Type: application/json" -d '{"email":"<email>","password":"<password>"}' http://localhost:4000/api/auth/login

2) Test protected route with cookie:
- curl -i -b cookies.txt http://localhost:4000/api/items

3) Test protected route without cookie:
- curl -i http://localhost:4000/api/items

4) Test admin-only route:
- curl -i -b cookies.txt http://localhost:4000/api/audit-logs

## Current Validation Status (this phase)
- Implemented checks verified by static scan:
  - middleware auth gate present for /api/* with auth route exceptions.
  - route-level getSessionUser + hasPermission present on modified protected handlers.
- Type/diagnostic check: no editor diagnostics for changed route files.
- Lint command blocker:
  - backend lint command executes, but eslint dependency resolution fails from shared config path in current environment.

## Exit Criteria
- All Group A/B/C routes validated with expected status codes across at least employee and admin roles.
- Any mismatches are fixed before merge.
