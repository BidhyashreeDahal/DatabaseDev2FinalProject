import { createPrismaClient } from "@/lib/prisma";
import { preflight, withCors } from "@/lib/cors";
import { getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

function parseId(params) {
  const id = Number(params?.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function OPTIONS(req) {
  return preflight(req, ["GET", "OPTIONS"]);
}

export async function GET(request, { params }) {
  const acquisitionId = parseId(await params);
  if (!acquisitionId) {
    return withCors(request, Response.json({ success: false, error: "Invalid acquisition id" }, { status: 400 }));
  }

  const prisma = createPrismaClient();
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }));
    }
    if (!hasPermission(sessionUser.role, "READ_ACQUISITION")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }));
    }

    const row = await prisma.acquisition.findUnique({
      where: { acquisition_id: acquisitionId },
      include: {
        source: {
          include: {
            dealer: true,
            collector: true,
            estate: true,
          },
        },
        item: {
          include: {
            book: {
              include: { author: true, publisher: true },
            },
            map: {
              include: { cartographer: true, publisher: true },
            },
            periodical: {
              include: { publisher: true },
            },
          },
        },
      },
    });

    if (!row) {
      return withCors(request, Response.json({ success: false, error: "Acquisition not found" }, { status: 404 }));
    }

    const acquisition = {
      acquisitionId: row.acquisition_id,
      sourceId: row.source_id,
      sourceName: row.source?.name || "Unknown Source",
      sourceType: row.source?.dealer
        ? "Dealer"
        : row.source?.collector
          ? "Collector"
          : row.source?.estate
            ? "Estate"
            : "Source",
      itemId: row.item_id,
      itemTitle: row.item?.title || "Unknown Item",
      acquisitionDate: row.item?.acquisition_date || null,
      acquisitionCost: Number(row.item?.acquisition_cost ?? 0),
      itemCategory: row.item?.book ? "Book" : row.item?.map ? "Map" : row.item?.periodical ? "Magazine" : "Other",
      itemCondition: row.item?.condition || null,
    };

    return withCors(
      request,
      Response.json({ success: true, acquisition }, { status: 200 }),
      ["GET", "OPTIONS"]
    );
  } catch (error) {
    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to load acquisition" }, { status: 500 }),
      ["GET", "OPTIONS"]
    );
  }
}
