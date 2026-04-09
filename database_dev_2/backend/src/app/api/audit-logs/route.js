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

    const { searchParams } = new URL(request.url);
    const pageParam = Number(searchParams.get("page")) || 1;
    const limitParam = Math.min(Math.max(Number(searchParams.get("limit")) || 20, 1), 100);
    const page = pageParam < 1 ? 1 : pageParam;
    const take = limitParam;
    const skip = (page - 1) * take;

    // Ensure table exists, then select events (done sequentially to avoid multi‑statement quirks)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS audit_event (
        id SERIAL PRIMARY KEY,
        action VARCHAR(50) NOT NULL,
        resource_type VARCHAR(50) NOT NULL,
        resource_id INTEGER,
        user_id INTEGER,
        summary VARCHAR(400),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const [eventRows, totalEvents] = await Promise.all([
      prisma.$queryRawUnsafe(
        `SELECT
           ae.id,
           ae.action,
           ae.resource_type,
           ae.resource_id,
           ae.user_id,
           ae.summary,
           ae.created_at,
           u.first_name,
           u.last_name,
           u.email
         FROM audit_event ae
         LEFT JOIN "user" u ON u.user_id = ae.user_id
         ORDER BY ae.created_at DESC
         OFFSET $1 LIMIT $2`,
        skip,
        take
      ),
      prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS count FROM audit_event`),
    ]);

    const total = Array.isArray(totalEvents) && totalEvents[0]?.count ? Number(totalEvents[0].count) : 0;

    const eventLogs = Array.isArray(eventRows)
      ? eventRows.map((e) => ({
          id: `evt-${e.id}`,
          action: String(e.action),
          actor:
            e.first_name || e.last_name
              ? `${e.first_name || ""} ${e.last_name || ""}`.trim()
              : e.email
                ? String(e.email)
                : "System",
          resourceType: String(e.resource_type),
          resourceId: e.resource_id === null || e.resource_id === undefined ? null : Number(e.resource_id),
          summary: String(e.summary ?? ""),
          timestamp: e.created_at,
        }))
      : [];

    return withCors(
      request,
      Response.json({ success: true, auditLogs: eventLogs, page, limit: take, total }, { status: 200 }),
      [
      "GET",
      "OPTIONS",
      ]
    );
  } catch (error) {
    return withCors(request, Response.json({ success: false, error: error.message }, { status: 500 }), [
      "GET",
      "OPTIONS",
    ]);
  }
}
