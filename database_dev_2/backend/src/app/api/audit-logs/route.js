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

export async function OPTIONS(req) {
  return preflight(req, ["GET", "OPTIONS"]);
}

export async function GET(request) {
  const prisma = createPrismaClient();
  try {
    const [sales, acquisitions] = await Promise.all([
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

    const auditLogs = [...saleLogs, ...acquisitionLogs]
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
