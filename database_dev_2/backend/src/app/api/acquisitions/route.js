/**
 * GET /api/acquisitions - List all acquisitions (with pagination, filtering, sorting)
 * POST /api/acquisitions - Create a new acquisition transaction
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
    const rows = await prisma.acquisition.findMany({
      where: search
        ? {
            OR: [
              { source: { name: { contains: search, mode: "insensitive" } } },
              { item: { title: { contains: search, mode: "insensitive" } } },
            ],
          }
        : undefined,
      include: {
        source: {
          include: {
            dealer: true,
            collector: true,
            estate: true,
          },
        },
        item: {
          select: {
            title: true,
            acquisition_cost: true,
            acquisition_date: true,
          },
        },
      },
      orderBy: { acquisition_id: "desc" },
      take: 100,
    });
    const acquisitions = rows.map((row) => ({
      acquisitionId: row.acquisition_id,
      itemId: row.item_id,
      itemTitle: row.item?.title || "Unknown Item",
      sourceId: row.source_id,
      sourceName: row.source?.name || "Unknown Source",
      sourceType: row.source?.dealer ? "Dealer" : row.source?.collector ? "Collector" : row.source?.estate ? "Estate" : "Source",
      acquisitionCost: Number(row.item?.acquisition_cost ?? 0),
      acquisitionDate: row.item?.acquisition_date ?? null,
    }));
    return withCors(request, Response.json({ success: true, acquisitions }, { status: 200 }), [
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
    // TODO: Extract body (supplierId, itemId, quantity, cost, date, notes)
    // Validate using validateAcquisitionPayload, check permissions (MANAGER/ADMIN)
    // Call acquisitionService.createAcquisition - updates item quantity
    // Log audit event: {action: 'CREATE_ACQUISITION', resourceId, userId}
    // Return created acquisition with 201 status
    return Response.json({ success: false, error: "Not implemented" }, { status: 501 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
