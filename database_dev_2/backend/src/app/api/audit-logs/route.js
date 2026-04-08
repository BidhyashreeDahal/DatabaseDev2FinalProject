/**
 * GET /api/audit-logs - List all audit logs (read-only, for compliance/debugging)
 * 
 * Purpose: Retrieve system audit trail showing all user actions on resources
 * 
 * Implementation needed:
 * 1. Extract query params (page, limit, dateFrom, dateTo, userId, action, resourceType)
 * 2. Validate permissions (ADMIN only - sensitive audit data)
 * 3. Call auditLogService.listAuditLogs(filters)
 * 4. Return paginated list of audit events with timestamps
 * 5. Each audit log entry should include: action, resourceType, resourceId, userId, changes, timestamp, ipAddress
 * 
 * Important: Audit logs should be immutable and only readable by ADMIN users
 */
import { createPrismaClient } from "@/lib/prisma";
import { preflight, withCors } from "@/lib/cors";
import { getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export async function OPTIONS(req) {
  return preflight(req, ["GET", "OPTIONS"]);
}

export async function GET(request) {
  const prisma = createPrismaClient();
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }), [
        "GET",
        "OPTIONS",
      ]);
    }
    if (!hasPermission(sessionUser.role, "READ_AUDIT_LOGS")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }), [
        "GET",
        "OPTIONS",
      ]);
    }

    const [sales, acquisitions, users, events] = await Promise.all([
      prisma.sales.findMany({
        include: {
          user: { select: { first_name: true, last_name: true, email: true } },
          item: { select: { title: true } },
          customer: { select: { first_name: true, last_name: true } },
        },
        orderBy: { sales_id: "desc" },
        take: 50,
      }),
      prisma.acquisition.findMany({
        include: {
          source: { select: { name: true } },
          item: { select: { title: true, acquisition_date: true } },
        },
        orderBy: { acquisition_id: "desc" },
        take: 50,
      }),
      prisma.user.findMany({
        include: {
          role: { select: { role_name: true } },
        },
        orderBy: { user_id: "desc" },
        take: 50,
      }),
      prisma.$queryRawUnsafe(`
        CREATE TABLE IF NOT EXISTS audit_event (
          id SERIAL PRIMARY KEY,
          action VARCHAR(50) NOT NULL,
          resource_type VARCHAR(50) NOT NULL,
          resource_id INTEGER,
          user_id INTEGER,
          summary VARCHAR(400),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        SELECT id, action, resource_type, resource_id, user_id, summary, created_at
        FROM audit_event
        ORDER BY created_at DESC
        LIMIT 200;
      `),
    ]);

    const saleLogs = sales.map((sale) => ({
      id: `sale-${sale.sales_id}`,
      action: "CREATE_SALE",
      actor: sale.user ? `${sale.user.first_name} ${sale.user.last_name}` : "System",
      resourceType: "sale",
      resourceId: sale.sales_id,
      summary: `Sold "${sale.item?.title || "Item"}" to ${sale.customer?.first_name || ""} ${sale.customer?.last_name || ""}`.trim(),
      timestamp: sale.sales_date,
    }));

    const acquisitionLogs = acquisitions.map((acq) => ({
      id: `acquisition-${acq.acquisition_id}`,
      action: "CREATE_ACQUISITION",
      actor: "System",
      resourceType: "acquisition",
      resourceId: acq.acquisition_id,
      summary: `Acquired "${acq.item?.title || "Item"}" from ${acq.source?.name || "Source"}`,
      timestamp: acq.item?.acquisition_date || null,
    }));

    const userLogs = users.map((user) => ({
      id: `user-${user.user_id}`,
      action: user.is_active ? "USER_ACTIVE" : "USER_DEACTIVATED",
      actor: "Admin",
      resourceType: "user",
      resourceId: user.user_id,
      summary: `User ${user.first_name} ${user.last_name} (${user.email}) - role: ${user.role?.role_name || "unknown"}`,
      timestamp: user.created_date || null,
    }));

    const eventLogs = Array.isArray(events)
      ? events.map((e) => ({
          id: `evt-${e.id}`,
          action: String(e.action),
          actor: "System",
          resourceType: String(e.resource_type),
          resourceId: Number(e.resource_id ?? 0),
          summary: String(e.summary ?? ""),
          timestamp: e.created_at,
        }))
      : [];

    const auditLogs = [...eventLogs, ...saleLogs, ...acquisitionLogs, ...userLogs]
      .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
      .slice(0, 100);

    return withCors(request, Response.json({ success: true, auditLogs }, { status: 200 }), [
      "GET",
      "OPTIONS",
    ]);
  } catch (error) {
    return withCors(request, Response.json({ success: false, error: error.message }, { status: 500 }), [
      "GET",
      "OPTIONS",
    ]);
  }
}
