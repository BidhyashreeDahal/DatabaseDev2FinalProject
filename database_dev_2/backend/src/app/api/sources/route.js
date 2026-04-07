/**
 * GET /api/sources - List all sources (with pagination, filtering, sorting)
 * POST /api/sources - Create a new source
 */
import { createPrismaClient } from "@/lib/prisma";
import { preflight, withCors } from "@/lib/cors";
import { getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export async function OPTIONS(req) {
  return preflight(req, ["GET", "POST", "OPTIONS"]);
}

export async function GET(request) {
  const prisma = createPrismaClient();
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }));
    }
    if (!hasPermission(sessionUser.role, "READ_SOURCE")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }));
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const rows = await prisma.source.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: {
        dealer: true,
        collector: true,
        estate: true,
        acquisitions: { select: { acquisition_id: true } },
      },
      orderBy: { source_id: "desc" },
      take: 100,
    });
    const sources = rows.map((row) => ({
      sourceId: row.source_id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      type: row.dealer ? "Dealer" : row.collector ? "Collector" : row.estate ? "Estate" : "Source",
      acquisitionCount: row.acquisitions.length,
    }));
    return withCors(request, Response.json({ success: true, sources }, { status: 200 }), [
      "GET",
      "POST",
      "OPTIONS",
    ]);
  } catch (error) {
    return withCors(request, Response.json({ success: false, error: error.message }, { status: 500 }), [
      "GET",
      "POST",
      "OPTIONS",
    ]);
  }
}

export async function POST(request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }));
    }
    if (!hasPermission(sessionUser.role, "CREATE_SOURCE")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }));
    }

    // TODO: Extract body, validate using validateSourcePayload
    // Check permissions (MANAGER/ADMIN), call sourceService.createSource
    // Log audit event: {action: 'CREATE_SOURCE', resourceId, userId}
    // Return created source with 201 status
    return withCors(
      request,
      Response.json({ success: false, error: "Not implemented" }, { status: 501 }),
      ["GET", "POST", "OPTIONS"]
    );
  } catch (error) {
    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to create source" }, { status: 500 }),
      ["GET", "POST", "OPTIONS"]
    );
  }
}
