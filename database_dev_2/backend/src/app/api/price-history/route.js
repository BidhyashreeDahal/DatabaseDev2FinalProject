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
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }), [
        "GET",
        "POST",
        "OPTIONS",
      ]);
    }
    if (!hasPermission(sessionUser.role, "READ_ITEM")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }), [
        "GET",
        "POST",
        "OPTIONS",
      ]);
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();

    const priceHistory = await prisma.price_history.findMany({
      where: search
        ? {
            OR: [
              { item: { title: { contains: search, mode: "insensitive" } } },
            ],
          }
        : undefined,
        include: {
          item: {
            select: { title: true },
          },
        },
      orderBy: { item_id: "desc" },
      take: 50,
    });

    const formatted = priceHistory.map((ph) => ({
      priceHistoryId: ph.price_history_id,
      title: ph?.item?.title || "Unknown Item",
      marketValue: Number(ph.market_value),
      recordedDate: ph.recorded_date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
    }),
      source: ph.source,
    }));

    console.log("Fetched price history data:", formatted);

    return withCors(request, Response.json({ success: true, items: formatted }, { status: 200 }), [
      "GET",
      "POST",
      "OPTIONS",
    ]);
  } catch (error) {
    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to load items" }, { status: 500 }),
      ["GET", "POST", "OPTIONS"]
    );
  }
}

export async function POST(request) {
  const prisma = createPrismaClient();
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }), [
        "GET",
        "POST",
        "OPTIONS",
      ]);
    }
    if (!hasPermission(sessionUser.role, "UPDATE_ITEM")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }), [
        "GET",
        "POST",
        "OPTIONS",
      ]);
    }

    const body = await request.json();
    const itemId = Number(body?.itemId);
    const marketValue = Number(body?.marketValue);
    const source = typeof body?.source === "string" ? body.source.trim() : "";
    const recordedDate = body?.recordedDate ? new Date(body.recordedDate) : new Date();

    if (!Number.isInteger(itemId) || itemId <= 0) {
      throw new Error("Valid itemId is required");
    }
    if (!Number.isFinite(marketValue) || marketValue <= 0) {
      throw new Error("marketValue must be a positive number");
    }
    if (!source) {
      throw new Error("source is required");
    }
    if (Number.isNaN(recordedDate.getTime())) {
      throw new Error("recordedDate is invalid");
    }

    const item = await prisma.item.findUnique({
      where: { item_id: itemId },
      select: { item_id: true },
    });
    if (!item) {
      return withCors(request, Response.json({ success: false, error: "Item not found" }, { status: 404 }), [
        "GET",
        "POST",
        "OPTIONS",
      ]);
    }

    const created = await prisma.price_history.create({
      data: {
        item_id: itemId,
        market_value: marketValue,
        recorded_date: recordedDate,
        source,
      },
    });

    return withCors(
      request,
      Response.json(
        {
          success: true,
          priceHistory: {
            priceHistoryId: created.price_history_id,
            itemId: created.item_id,
            marketValue: Number(created.market_value),
            recordedDate: created.recorded_date,
            source: created.source,
          },
        },
        { status: 201 }
      ),
      ["GET", "POST", "OPTIONS"]
    );
  } catch (error) {
    const message = error?.message || "Failed to create price history";
    const status = /required|invalid|must/i.test(message) ? 400 : 500;
    return withCors(request, Response.json({ success: false, error: message }, { status }), [
      "GET",
      "POST",
      "OPTIONS",
    ]);
  }
}
