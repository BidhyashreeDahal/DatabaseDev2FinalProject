/**
 * GET /api/sources - List all sources (with pagination, filtering, sorting)
 * POST /api/sources - Create a new source
 */
import { createPrismaClient } from "@/lib/prisma";
import { preflight, withCors } from "@/lib/cors";
import { getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

function normalizeSourceType(input) {
  const raw = String(input || "").trim().toLowerCase();
  if (raw === "dealer") return "Dealer";
  if (raw === "collector") return "Collector";
  if (raw === "estate") return "Estate";
  return "Source";
}

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
  const prisma = createPrismaClient();
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }));
    }
    if (!hasPermission(sessionUser.role, "CREATE_SOURCE")) {
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
        ["GET", "POST", "OPTIONS"]
      );
    }

    const created = await prisma.$transaction(async (tx) => {
      const source = await tx.source.create({
        data: { name, email, phone },
      });

      if (type === "Dealer") {
        await tx.dealer.create({
          data: {
            source_id: source.source_id,
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
        await tx.collector.create({
          data: {
            source_id: source.source_id,
            collecting_interests: String(body?.collectingInterests || "").trim() || null,
            notes: String(body?.collectorNotes || "").trim() || null,
          },
        });
      } else if (type === "Estate") {
        const estateName = String(body?.estateName || "").trim() || `${name} Estate`;
        await tx.estate.create({
          data: {
            source_id: source.source_id,
            estate_name: estateName,
            contact_person: String(body?.contactPerson || "").trim() || null,
            notes: String(body?.estateNotes || "").trim() || null,
          },
        });
      }

      return source;
    });

    const source = {
      sourceId: created.source_id,
      name: created.name,
      email: created.email,
      phone: created.phone,
      type,
      acquisitionCount: 0,
    };

    return withCors(
      request,
      Response.json({ success: true, source }, { status: 201 }),
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
