import { createPrismaClient } from "@/lib/prisma";
import { preflight, withCors } from "@/lib/cors";
import { getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

function parseId(params) {
  const id = Number(params?.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function toType(row) {
  if (row?.dealer) return "Dealer";
  if (row?.collector) return "Collector";
  if (row?.estate) return "Estate";
  return "Source";
}

function normalizeSourceType(input) {
  const raw = String(input || "").trim().toLowerCase();
  if (raw === "dealer") return "Dealer";
  if (raw === "collector") return "Collector";
  if (raw === "estate") return "Estate";
  return "Source";
}

export async function OPTIONS(req) {
  return preflight(req, ["GET", "PATCH", "DELETE", "OPTIONS"]);
}

export async function GET(request, { params }) {
  const sourceId = parseId(await params);
  if (!sourceId) {
    return withCors(request, Response.json({ success: false, error: "Invalid source id" }, { status: 400 }));
  }

  const prisma = createPrismaClient();
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }));
    }
    if (!hasPermission(sessionUser.role, "READ_SOURCE")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }));
    }

    const row = await prisma.source.findUnique({
      where: { source_id: sourceId },
      include: {
        dealer: true,
        collector: true,
        estate: true,
        acquisitions: {
          include: {
            item: {
              select: { title: true, acquisition_cost: true, acquisition_date: true },
            },
          },
          orderBy: { acquisition_id: "desc" },
          take: 25,
        },
      },
    });

    if (!row) {
      return withCors(request, Response.json({ success: false, error: "Source not found" }, { status: 404 }));
    }

    const source = {
      sourceId: row.source_id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      type: toType(row),
      dealer: row.dealer,
      collector: row.collector,
      estate: row.estate,
      acquisitionCount: row.acquisitions.length,
      acquisitions: row.acquisitions.map((a) => ({
        acquisitionId: a.acquisition_id,
        itemId: a.item_id,
        itemTitle: a.item?.title || "Unknown Item",
        acquisitionCost: Number(a.item?.acquisition_cost ?? 0),
        acquisitionDate: a.item?.acquisition_date || null,
      })),
    };

    return withCors(
      request,
      Response.json({ success: true, source }, { status: 200 }),
      ["GET", "PATCH", "DELETE", "OPTIONS"]
    );
  } catch (error) {
    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to load source" }, { status: 500 }),
      ["GET", "PATCH", "DELETE", "OPTIONS"]
    );
  }
}

export async function PATCH(request, { params }) {
  const sourceId = parseId(await params);
  if (!sourceId) {
    return withCors(request, Response.json({ success: false, error: "Invalid source id" }, { status: 400 }));
  }

  const prisma = createPrismaClient();
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }));
    }
    if (!hasPermission(sessionUser.role, "UPDATE_SOURCE")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }));
    }

    const body = await request.json();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim() || null;
    const phone = String(body?.phone || "").trim() || null;
    const type = normalizeSourceType(body?.type);

    if (!name) {
      return withCors(
        request,
        Response.json({ success: false, error: "Source name is required" }, { status: 400 }),
        ["GET", "PATCH", "DELETE", "OPTIONS"]
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const source = await tx.source.update({
        where: { source_id: sourceId },
        data: { name, email, phone },
      });

      if (type === "Dealer") {
        await tx.collector.deleteMany({ where: { source_id: sourceId } });
        await tx.estate.deleteMany({ where: { source_id: sourceId } });
        await tx.dealer.upsert({
          where: { source_id: sourceId },
          update: {
            specialty: String(body?.specialty || "").trim() || null,
            reliability_rating:
              Number.isInteger(body?.reliabilityRating) && body.reliabilityRating > 0
                ? body.reliabilityRating
                : null,
            price_range_notes: String(body?.priceRangeNotes || "").trim() || null,
            negotiation_notes: String(body?.negotiationNotes || "").trim() || null,
          },
          create: {
            source_id: sourceId,
            specialty: String(body?.specialty || "").trim() || null,
            reliability_rating:
              Number.isInteger(body?.reliabilityRating) && body.reliabilityRating > 0
                ? body.reliabilityRating
                : null,
            price_range_notes: String(body?.priceRangeNotes || "").trim() || null,
            negotiation_notes: String(body?.negotiationNotes || "").trim() || null,
          },
        });
      } else if (type === "Collector") {
        await tx.dealer.deleteMany({ where: { source_id: sourceId } });
        await tx.estate.deleteMany({ where: { source_id: sourceId } });
        await tx.collector.upsert({
          where: { source_id: sourceId },
          update: {
            collecting_interests: String(body?.collectingInterests || "").trim() || null,
            notes: String(body?.collectorNotes || "").trim() || null,
          },
          create: {
            source_id: sourceId,
            collecting_interests: String(body?.collectingInterests || "").trim() || null,
            notes: String(body?.collectorNotes || "").trim() || null,
          },
        });
      } else if (type === "Estate") {
        await tx.dealer.deleteMany({ where: { source_id: sourceId } });
        await tx.collector.deleteMany({ where: { source_id: sourceId } });
        await tx.estate.upsert({
          where: { source_id: sourceId },
          update: {
            estate_name: String(body?.estateName || "").trim() || `${name} Estate`,
            contact_person: String(body?.contactPerson || "").trim() || null,
            notes: String(body?.estateNotes || "").trim() || null,
          },
          create: {
            source_id: sourceId,
            estate_name: String(body?.estateName || "").trim() || `${name} Estate`,
            contact_person: String(body?.contactPerson || "").trim() || null,
            notes: String(body?.estateNotes || "").trim() || null,
          },
        });
      } else {
        await tx.dealer.deleteMany({ where: { source_id: sourceId } });
        await tx.collector.deleteMany({ where: { source_id: sourceId } });
        await tx.estate.deleteMany({ where: { source_id: sourceId } });
      }

      return source;
    });

    const source = {
      sourceId: updated.source_id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      type,
    };

    return withCors(
      request,
      Response.json({ success: true, source }, { status: 200 }),
      ["GET", "PATCH", "DELETE", "OPTIONS"]
    );
  } catch (error) {
    const status = error.code === "P2025" ? 404 : 500;
    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to update source" }, { status }),
      ["GET", "PATCH", "DELETE", "OPTIONS"]
    );
  }
}

export async function DELETE(request, { params }) {
  const sourceId = parseId(await params);
  if (!sourceId) {
    return withCors(request, Response.json({ success: false, error: "Invalid source id" }, { status: 400 }));
  }

  const prisma = createPrismaClient();
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }));
    }
    if (!hasPermission(sessionUser.role, "DELETE_SOURCE")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }));
    }

    const acquisitionCount = await prisma.acquisition.count({ where: { source_id: sourceId } });
    if (acquisitionCount > 0) {
      return withCors(
        request,
        Response.json(
          { success: false, error: "Cannot delete source with existing acquisitions" },
          { status: 409 }
        ),
        ["GET", "PATCH", "DELETE", "OPTIONS"]
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.dealer.deleteMany({ where: { source_id: sourceId } });
      await tx.collector.deleteMany({ where: { source_id: sourceId } });
      await tx.estate.deleteMany({ where: { source_id: sourceId } });
      await tx.source.delete({ where: { source_id: sourceId } });
    });

    return withCors(
      request,
      Response.json({ success: true, message: "Source deleted successfully" }, { status: 200 }),
      ["GET", "PATCH", "DELETE", "OPTIONS"]
    );
  } catch (error) {
    const status = error.code === "P2025" ? 404 : 500;
    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to delete source" }, { status }),
      ["GET", "PATCH", "DELETE", "OPTIONS"]
    );
  }
}
