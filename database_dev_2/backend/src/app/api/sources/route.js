/**
 * GET /api/sources - List all sources (with pagination, filtering, sorting)
 * POST /api/sources - Create a new source
 */
import { createPrismaClient } from "@/lib/prisma";
import { preflight, withCors } from "@/lib/cors";

export async function OPTIONS(req) {
  return preflight(req, ["GET", "POST", "OPTIONS"]);
}

export async function GET(request) {
  const prisma = createPrismaClient();
  try {
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
    // TODO: Extract body, validate using validateSourcePayload
    // Check permissions (MANAGER/ADMIN), call sourceService.createSource
    // Log audit event: {action: 'CREATE_SOURCE', resourceId, userId}
    // Return created source with 201 status
    return Response.json({ success: false, error: "Not implemented" }, { status: 501 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
