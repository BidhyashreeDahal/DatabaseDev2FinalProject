/**
 * GET /api/acquisitions - List all acquisitions (with pagination, filtering, sorting)
 * POST /api/acquisitions - Create a new acquisition transaction
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
    if (!hasPermission(sessionUser.role, "READ_ACQUISITION")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }));
    }

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
  const prisma = createPrismaClient();
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }));
    }
    if (!hasPermission(sessionUser.role, "CREATE_ACQUISITION")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }));
    }

    const body = await request.json();
    const sourceId = Number(body?.sourceId);
    const itemId = Number(body?.itemId);

    if (!Number.isInteger(sourceId) || sourceId <= 0) {
      return withCors(
        request,
        Response.json({ success: false, error: "Valid sourceId is required" }, { status: 400 }),
        ["GET", "POST", "OPTIONS"]
      );
    }
    if (!Number.isInteger(itemId) || itemId <= 0) {
      return withCors(
        request,
        Response.json({ success: false, error: "Valid itemId is required" }, { status: 400 }),
        ["GET", "POST", "OPTIONS"]
      );
    }

    const [source, item] = await Promise.all([
      prisma.source.findUnique({ where: { source_id: sourceId } }),
      prisma.item.findUnique({ where: { item_id: itemId } }),
    ]);
    if (!source) {
      return withCors(
        request,
        Response.json({ success: false, error: "Source not found" }, { status: 404 }),
        ["GET", "POST", "OPTIONS"]
      );
    }
    if (!item) {
      return withCors(
        request,
        Response.json({ success: false, error: "Item not found" }, { status: 404 }),
        ["GET", "POST", "OPTIONS"]
      );
    }

    const existing = await prisma.acquisition.findFirst({
      where: { source_id: sourceId, item_id: itemId },
    });
    if (existing) {
      return withCors(
        request,
        Response.json({ success: false, error: "Acquisition already exists for this source and item" }, { status: 409 }),
        ["GET", "POST", "OPTIONS"]
      );
    }

    const created = await prisma.acquisition.create({
      data: { source_id: sourceId, item_id: itemId },
      include: {
        source: {
          include: { dealer: true, collector: true, estate: true },
        },
        item: {
          select: { title: true, acquisition_cost: true, acquisition_date: true },
        },
      },
    });

    const acquisition = {
      acquisitionId: created.acquisition_id,
      sourceId: created.source_id,
      sourceName: created.source?.name || "Unknown Source",
      sourceType: created.source?.dealer
        ? "Dealer"
        : created.source?.collector
          ? "Collector"
          : created.source?.estate
            ? "Estate"
            : "Source",
      itemId: created.item_id,
      itemTitle: created.item?.title || "Unknown Item",
      acquisitionCost: Number(created.item?.acquisition_cost ?? 0),
      acquisitionDate: created.item?.acquisition_date || null,
    };

    return withCors(
      request,
      Response.json({ success: true, acquisition }, { status: 201 }),
      ["GET", "POST", "OPTIONS"]
    );
  } catch (error) {
    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to create acquisition" }, { status: 500 }),
      ["GET", "POST", "OPTIONS"]
    );
  }
}
